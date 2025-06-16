import { useEffect } from "react";

export function useOutsideClick( ref: React.RefObject<HTMLElement | null>, callback: () => void) {
    useEffect(() => {
        function handler(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
                console.log(ref.current);
            }
        } 

        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
        }
    }, [ref, callback])
}

//HOW TO USE
// IMPORT useRef and useState

//  const [showDropdown, setshowDropdown] = useState(false);
//  const containerRef = useRef<HTMLDivElement>(null);

// THEN use the HOOK
// useOutsideClick(containerRef, () => setshowDropdown(false))

//use useState (setshowDropdown in this case) to toggle visibility .. setshowDropdown(true/false)

//In the <div> remember to set ref
// <div ref={containerRef} className="relative ....">

//Check SearchBar.tsx in Header for a example