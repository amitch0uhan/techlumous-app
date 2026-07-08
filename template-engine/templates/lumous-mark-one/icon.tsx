export default function Icon({
  size = 16,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.707016 14.4928L-9.33364e-05 13.7856L5.53215 8.29288L13.5322 0.292876L14.9464 0.292876L14.9464 1.70709L1.41412 15.1998L0.707016 14.4928Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2393 15L13.2393 15L13.2393 1.99999L0.239257 1.99999C0.239257 0.999986 0.239256 0.999987 0.239256 0.999987C0.239256 0.999987 0.239257 0.999985 0.239256 -1.27554e-05L14.2393 -1.34389e-05L15.2393 -1.52588e-05L15.2393 0.999987L15.2393 15L14.2393 15Z"
      />
    </svg>
  )
}
