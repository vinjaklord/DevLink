import { Member } from '../models/members.js';
import { Friend } from '../models/friends.js';
import HttpError from '../models/http-error.js';
import { getDistance } from 'geolib';

/**
 * Get location-based member recommendations
 * Excludes: self, existing friends, pending sent/received requests
 * Returns max 20 users sorted by distance
 */
const getRecommendations = async (req, res, next) => {
  try {
    if (!req.verifiedMember) {
      throw new HttpError('Unauthorized', 401);
    }

    const currentUserId = req.verifiedMember._id;

    // Get current user's data
    const currentUser = await Member.findById(currentUserId);

    if (!currentUser) {
      throw new HttpError('User not found', 404);
    }

    // Get user's friend relationships
    const friendDoc = await Friend.findOne({ member: currentUserId });

    // Build exclusion list: self + friends + pending requests (both sent and received)
    const excludedIds = [currentUserId];

    if (friendDoc) {
      // Add existing friends
      if (friendDoc.friends?.length > 0) {
        excludedIds.push(...friendDoc.friends);
      }

      // Add users who sent me requests (pending received)
      if (friendDoc.pendingFriendRequests?.length > 0) {
        excludedIds.push(...friendDoc.pendingFriendRequests);
      }
    }

    // Find users who received my friend requests (pending sent)
    const sentRequestsDocs = await Friend.find({
      pendingFriendRequests: currentUserId,
    }).select('member');

    const sentRequestsIds = sentRequestsDocs.map((doc) => doc.member);
    excludedIds.push(...sentRequestsIds);

    // Check if user has location data
    if (
      !currentUser.location?.coordinates?.coordinates ||
      (currentUser.location.coordinates.coordinates[0] === 0 &&
        currentUser.location.coordinates.coordinates[1] === 0)
    ) {
      // Fallback: return random users with valid location
      const randomUsers = await Member.find({
        _id: { $nin: excludedIds },
        'location.coordinates.coordinates.0': { $exists: true, $ne: 0 },
        'location.coordinates.coordinates.1': { $exists: true, $ne: 0 },
      })
        .select('username firstName lastName photo location')
        .limit(20)
        .lean();

      // Format response
      const formatted = randomUsers.map((user) => ({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photo: user.photo,
        location: {
          city: user.location?.city,
          country: user.location?.country,
        },
      }));

      return res.json(formatted);
    }

    const [userLng, userLat] = currentUser.location.coordinates.coordinates;

    // Use MongoDB geospatial query to find nearby users
    let nearbyUsers = await Member.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [userLng, userLat],
          },
          distanceField: 'distance',
          maxDistance: 500000, // 500km radius (adjust as needed)
          spherical: true,
          query: {
            _id: { $nin: excludedIds },
            'location.coordinates.coordinates': { $exists: true, $ne: null },
          },
        },
      },
      {
        $match: {
          // Additional filter to ensure valid coordinates
          'location.coordinates.coordinates.0': { $ne: 0 },
          'location.coordinates.coordinates.1': { $ne: 0 },
        },
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          photo: 1,
          location: 1,
          distance: 1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    // If not enough nearby users found, add some random users to fill up to 20
    if (nearbyUsers.length < 20) {
      const nearbyIds = nearbyUsers.map((u) => u._id);
      const additionalExcluded = [...excludedIds, ...nearbyIds];

      const additionalUsers = await Member.find({
        _id: { $nin: additionalExcluded },
        'location.coordinates.coordinates.0': { $ne: 0 }, // Only users with valid location
        'location.coordinates.coordinates.1': { $ne: 0 },
      })
        .select('username firstName lastName photo location')
        .limit(20 - nearbyUsers.length)
        .lean();

      // Add distance for additional users (they're outside the radius)
      additionalUsers.forEach((user) => {
        if (user.location?.coordinates?.coordinates) {
          const [lng, lat] = user.location.coordinates.coordinates;
          user.distance = getDistance(
            { latitude: userLat, longitude: userLng },
            { latitude: lat, longitude: lng }
          );
        }
      });

      nearbyUsers = [...nearbyUsers, ...additionalUsers];
    }

    // Remove distance field from response (users don't need to see exact meters)
    const recommendations = nearbyUsers.map((user) => ({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo,
      location: {
        city: user.location?.city,
        country: user.location?.country,
      },
    }));

    res.json(recommendations);
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return next(new HttpError(error.message || 'Failed to get recommendations', 500));
  }
};

/**
 * Update user location manually (optional endpoint)
 */
const updateLocation = async (req, res, next) => {
  try {
    if (!req.verifiedMember) {
      throw new HttpError('Unauthorized', 401);
    }

    const { city, country, countryCode, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new HttpError('Latitude and longitude are required', 400);
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.verifiedMember._id,
      {
        location: {
          city,
          country,
          countryCode,
          coordinates: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      throw new HttpError('Member not found', 404);
    }

    res.json({ message: 'Location updated successfully', location: updatedMember.location });
  } catch (error) {
    console.error('Error in updateLocation:', error);
    return next(new HttpError(error.message || 'Failed to update location', 500));
  }
};

export { getRecommendations, updateLocation };
