export const signupMailHTML = (firstName, lastName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { color: #1a73e8; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .button { display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #1a73e8; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Welcome to Our Community! 👋</div>
        
        <p>Hello, ${firstName} ${lastName}!</p>
        
        <p>We're thrilled to have you join our growing network. Get ready to connect, share, and explore!</p>
        
        <br /><br />
        <p style="font-size: 14px; color: #777;">
            Best regards,<br>
            The Admin Team
        </p>
    </div>
</body>
</html>
`;