import type { SVGProps } from "react";

const UkraineFlag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <title id="ukraineFlagTitle">Ukraine Flag</title>
    <path
      fill="#FFDA44"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
    ></path>
    <path fill="#338AF3" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10"></path>
  </svg>
);
const GreatBritainFlag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <title id="greatBritainFlagTitle">Great Britain Flag</title>
    <path
      fill="#F0F0F0"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
    ></path>
    <path
      fill="#0052B4"
      d="M4.067 5.912a9.964 9.964 0 00-1.723 3.48h5.203l-3.48-3.48zM21.655 9.391a9.964 9.964 0 00-1.722-3.48l-3.48 3.48h5.202zM2.344 14.609a9.963 9.963 0 001.723 3.48l3.48-3.48H2.344zM18.088 4.067a9.964 9.964 0 00-3.48-1.723v5.203l3.48-3.48zM5.912 19.933a9.964 9.964 0 003.48 1.723v-5.203l-3.48 3.48zM9.391 2.344a9.965 9.965 0 00-3.48 1.723l3.48 3.48V2.344zM14.609 21.655a9.964 9.964 0 003.48-1.722l-3.48-3.48v5.203zM16.453 14.609l3.48 3.48a9.964 9.964 0 001.722-3.48h-5.202z"
    ></path>
    <path
      fill="#D80027"
      d="M21.915 10.696h-8.61V2.085a10.1 10.1 0 00-2.61 0v8.61h-8.61a10.1 10.1 0 000 2.61h8.61v8.61a10.115 10.115 0 002.61 0v-8.61h8.61a10.115 10.115 0 000-2.61z"
    ></path>
    <path
      fill="#D80027"
      d="M14.609 14.609l4.462 4.462c.205-.205.401-.42.588-.642l-3.82-3.82h-1.23zM9.391 14.609L4.93 19.07c.205.205.42.401.642.588l3.82-3.82v-1.23zM9.391 9.391L4.93 4.93c-.205.205-.401.42-.588.642l3.82 3.82h1.23zM14.609 9.392l4.462-4.463a10.01 10.01 0 00-.642-.588l-3.82 3.82v1.23z"
    ></path>
  </svg>
);

const AustriaFlag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <title id="austriaFlagTitle">Austria Flag</title>
    <path
      fill="#F0F0F0"
      d="M21.378 15.478A9.977 9.977 0 0022 12c0-1.223-.22-2.395-.622-3.478L12 7.652l-9.378.87A9.979 9.979 0 002 12c0 1.223.22 2.395.622 3.478l9.378.87 9.378-.87z"
    ></path>
    <path
      fill="#D80027"
      d="M12 22c4.3 0 7.965-2.714 9.378-6.522H2.622C4.035 19.286 7.7 22 12 22zM12 2C7.7 2 4.035 4.714 2.622 8.522h18.756A10.004 10.004 0 0012 2z"
    ></path>
  </svg>
);
const RussiaFlag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <title id="russiaFlagTitle">Russia Flag</title>
    <path
      fill="#F0F0F0"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
    ></path>
    <path
      fill="#0052B4"
      d="M21.378 15.478A9.977 9.977 0 0022 12c0-1.223-.22-2.395-.622-3.478H2.622A9.979 9.979 0 002 12c0 1.223.22 2.395.622 3.478l9.378.87 9.378-.87z"
    ></path>
    <path
      fill="#D80027"
      d="M12 22c4.3 0 7.965-2.714 9.378-6.522H2.622A10.003 10.003 0 0012 22z"
    ></path>
  </svg>
);
export { UkraineFlag, GreatBritainFlag, AustriaFlag, RussiaFlag };
