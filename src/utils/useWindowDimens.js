import { useEffect, useState } from "react";
import { debounce } from "lodash";

const useWindowDimens = () => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleWidth = debounce(() => {
      setInnerWidth(window.innerWidth);
    }, 300); // Adjust the delay as needed

    window.addEventListener("resize", handleWidth);
    return () => window.removeEventListener("resize", handleWidth);
  }, []);

  return innerWidth;
};

export default useWindowDimens;
