import React from "react"
import DrawerButton from "./DrawerButton"

interface LeftDrawerProps {
  isOpen: boolean
  onToggle: () => void
  children?: React.ReactNode
}

const LeftDrawer: React.FC<LeftDrawerProps> = ({ isOpen, onToggle, children }) => {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-40 w-[600px] bg-white text-black shadow-lg`}
      >
        <DrawerButton
          onClick={onToggle}
          isOpen={isOpen}
          position="left"
          className="absolute top-4 right-4"
        />

        {children}
      </div>

      {/* Handle for opening the drawer */}
      <DrawerButton
        onClick={onToggle}
        isOpen={isOpen}
        position="left"
        className={`fixed top-1/2 left-0 z-50 -translate-y-1/2 bg-white shadow transition-opacity duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
    </>
  )
}

export default LeftDrawer
