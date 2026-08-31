import React from 'react';

interface MountainLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'slip';
  className?: string;
  showText?: boolean;
}

export const MountainLogo: React.FC<MountainLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'xs':
        return { width: 24, height: 27 };
      case 'sm':
        return { width: 34, height: 38 };
      case 'md':
        return { width: 48, height: 54 };
      case 'lg':
        return { width: 72, height: 81 };
      case 'xl':
        return { width: 96, height: 108 };
      case '2xl':
        return { width: 140, height: 158 };
      case 'slip':
        return { width: 88, height: 99 };
      default:
        return { width: 48, height: 54 };
    }
  };

  const { width, height } = getDimensions();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 500 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
      >
        <defs>
          <path id="curveBottomText" d="M 68,340 Q 250,515 432,340" />
        </defs>

        {/* 1. Outer Red Shield Background */}
        <path
          d="M 48 38 Q 250 20 452 38 C 472 230 415 425 250 495 C 85 425 28 230 48 38 Z"
          fill="#E51937"
        />

        {/* 2. Top Title: MOUNTAIN */}
        <text
          x="250"
          y="94"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Arial Black', 'Montserrat', 'Impact', sans-serif"
          fontSize="44"
          fontWeight="900"
          letterSpacing="5"
        >
          MOUNTAIN
        </text>

        {/* 3. Inner White Shield */}
        <path
          d="M 86 112 Q 250 98 414 112 C 428 250 376 385 250 426 C 124 385 72 250 86 112 Z"
          fill="#FFFFFF"
          stroke="#00358E"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* 4. Inner Blue Decorative Border Line */}
        <path
          d="M 96 122 Q 250 110 404 122 C 416 242 368 368 250 408 C 132 368 84 242 96 122 Z"
          fill="none"
          stroke="#00358E"
          strokeWidth="2"
          opacity="0.85"
        />

        {/* 5. Blue Background Swoosh Wing behind MSS */}
        <path
          d="M 215 160 C 230 140 280 140 330 160 C 335 200 310 240 280 260 C 240 250 200 240 180 230 C 180 200 195 175 215 160 Z"
          fill="#00358E"
        />

        {/* 6. Left Blue 'M' */}
        <path
          d="M 102 305 L 140 198 L 180 198 L 208 258 L 232 198 L 272 198 L 234 305 L 198 305 L 174 246 L 148 305 Z"
          fill="#00358E"
        />

        {/* 7. Right Blue 'S' */}
        <path
          d="M 312 218 C 312 202 328 196 348 196 C 372 196 386 208 390 224 L 354 230 C 352 222 346 220 338 220 C 330 220 326 223 326 229 C 326 235 332 238 344 242 L 362 249 C 385 258 394 272 394 288 C 394 310 372 322 344 322 C 316 322 298 306 296 288 L 332 282 C 334 292 340 298 350 298 C 358 298 364 293 364 287 C 364 281 358 277 346 272 L 328 265 C 314 256 312 238 312 218 Z"
          fill="#00358E"
        />

        {/* 8. Center Red 'S' with Crisp White Outer Boundary Stroke */}
        <g>
          {/* Outer White Outline for Crisp Separation */}
          <path
            d="M 200 248 C 200 205 236 186 284 186 C 332 186 360 210 364 245 L 306 252 C 304 235 293 225 278 225 C 262 225 252 231 252 243 C 252 254 265 261 288 268 L 310 276 C 355 288 374 311 374 343 C 374 382 336 405 281 405 C 227 405 195 379 191 340 L 249 334 C 252 352 265 363 284 363 C 300 363 310 353 310 340 C 310 327 297 320 275 313 L 253 305 C 213 290 200 271 200 248 Z"
            fill="#E51937"
            stroke="#FFFFFF"
            strokeWidth="15"
            strokeLinejoin="round"
          />
          {/* Inner Red Fill */}
          <path
            d="M 200 248 C 200 205 236 186 284 186 C 332 186 360 210 364 245 L 306 252 C 304 235 293 225 278 225 C 262 225 252 231 252 243 C 252 254 265 261 288 268 L 310 276 C 355 288 374 311 374 343 C 374 382 336 405 281 405 C 227 405 195 379 191 340 L 249 334 C 252 352 265 363 284 363 C 300 363 310 353 310 340 C 310 327 297 320 275 313 L 253 305 C 213 290 200 271 200 248 Z"
            fill="#E51937"
          />
        </g>

        {/* 9. Wave Blue Banner under 'MSS' with "Security" */}
        <path
          d="M 180 340 Q 250 330 320 340 Q 325 375 300 380 Q 250 365 190 375 Q 175 365 180 340 Z"
          fill="#00358E"
        />
        <text
          x="245"
          y="367"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Trebuchet MS', 'Arial', sans-serif"
          fontSize="28"
          fontWeight="bold"
          fontStyle="italic"
          letterSpacing="1"
        >
          Security
        </text>

        {/* 10. Bottom Curved Text: SECURITY SERVICES */}
        <text fill="#FFFFFF" fontFamily="'Arial Black', 'Montserrat', 'Impact', sans-serif" fontSize="34" fontWeight="900" letterSpacing="3.5">
          <textPath href="#curveBottomText" startOffset="50%" textAnchor="middle">
            SECURITY SERVICES
          </textPath>
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-slate-900 leading-none text-lg flex items-center gap-1.5">
            <span className="text-red-600 font-black">MOUNTAIN</span>
            <span className="text-blue-900 font-black">SECURITY SERVICES</span>
          </span>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
            PVT (LTD.) • Faisalabad, Pakistan
          </span>
        </div>
      )}
    </div>
  );
};
