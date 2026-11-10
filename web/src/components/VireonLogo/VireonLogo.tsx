import React from 'react'

interface Props {
  size?: number
  className?: string
}

const VireonLogo: React.FC<Props> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="4" width="92" height="92" rx="24" fill="#0A1A3C" />
      <path
        d="M26 28 L50 72 L74 28"
        stroke="#2F80ED"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="50" cy="78" r="5" fill="#38BDF8" />
    </svg>
  )
}

export default VireonLogo
