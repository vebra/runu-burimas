import { Link } from 'react-router-dom'

interface AuthGateProps {
  message?: string
}

export function AuthGate({ message = 'Norėdami atlikti būrimą, turite prisijungti.' }: AuthGateProps) {
  return (
    <div className="min-h-screen py-12 px-4 w-full flex justify-center items-center">
      <div className="text-center w-full max-w-md flex flex-col items-center gap-6">
        <span className="text-6xl block" aria-hidden="true">🔐</span>
        <h2 className="text-2xl font-cinzel font-bold text-white">
          Prisijunkite
        </h2>
        <p className="text-gray-400">
          {message}
        </p>
        <Link
          to="/auth"
          className="bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-700 hover:via-purple-600 hover:to-violet-500 text-amber-100 font-semibold py-4 px-8 text-lg rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/30 border border-amber-600/20"
        >
          Prisijungti
        </Link>
      </div>
    </div>
  )
}
