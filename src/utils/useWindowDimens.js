import { useEffect, useState } from "react";

const useWindowDimens = () => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  useEffect(() => {
    function handleWidth() {
      setInnerWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleWidth);
    return () => window.removeEventListener("resize", handleWidth);
  }, []);
  return innerWidth;
};

export default useWindowDimens;
