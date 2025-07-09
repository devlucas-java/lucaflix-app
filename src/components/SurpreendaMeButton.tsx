// import { useNavigate } from 'react-router-dom';
// //integra os service e fazer a bsuca de um anime serie ou fimle e setar o modla como true 
// const contentTypes = ['filme', 'serie'] as const;

// export const getRandomId = (): number => {
//   return Math.floor(Math.random() * (100 + 1)) + 40;
// };

// export const getRandomType = (): string => {
//   const randomIndex = Math.floor(Math.random() * contentTypes.length);
//   return contentTypes[randomIndex];
// };

// export const SurpriseMeButton: React.FC = () => {
//   const navigate = useNavigate();

//   const handleSurpriseMe = () => {
//     const randomType = getRandomType();
//     const randomId = getRandomId();
//     navigate(`/${randomType}/${randomId}`);
//   };

//   return (
//     <button
//       onClick={handleSurpriseMe}
//       className={`
//         fixed 
//         bottom-6 right-4 
//         sm:bottom-8 sm:right-6 
//         md:bottom-10 md:right-10 
//         lg:bottom-12 lg:right-14 
//         xl:bottom-14 xl:right-16 
//         2xl:bottom-16 2xl:right-20
//         z-50 
//         px-4 py-2 
//         sm:px-5 sm:py-3 
//         md:px-6 md:py-3.5 
//         text-sm sm:text-base md:text-lg lg:text-xl 
//         rounded-full 
//         bg-gradient-to-r from-transparent via-gray-50/10 to-transparent 
//         text-red-600 hover:text-red-700
//         border border-red-300 hover:border-red-500
//         shadow-md shadow-red-200 hover:shadow-xl hover:shadow-red-300
//         backdrop-blur-sm
//         transition-all duration-300 ease-out
//         transform hover:scale-105 hover:rotate-3 active:scale-95
//         group 
//         flex items-center gap-2 sm:gap-3 md:gap-4
//         overflow-hidden
//         before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-pink-300/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
//       `}
//     >
//       <svg
//         className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-500 animate-pulse"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
//         <path d="m18 2 4 4-4 4" />
//         <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
//         <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8c-.7-1.1-2-1.8-3.3-1.8H2" />
//         <path d="m6 14-4-4 4-4" />
//       </svg>
//       <span className="hidden sm:inline font-semibold">Surpreenda-me</span>
//     </button>
//   );
// };
