import React from "react"
import DrawerButton from "./DrawerButton"

interface RightDrawerProps {
  isOpen: boolean
  onToggle: () => void
  children?: React.ReactNode
}

const RightDrawer: React.FC<RightDrawerProps> = ({ isOpen, onToggle, children }) => {
  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-40 w-64 bg-white text-black shadow-lg`}
      >
        <DrawerButton
          onClick={onToggle}
          isOpen={isOpen}
          position="right"
          className="absolute top-4 right-4"
        />
        <div className="h-full overflow-y-auto p-4">{children}</div>
      </div>

      {/* Handle for opening the drawer */}
      <DrawerButton
        onClick={onToggle}
        isOpen={isOpen}
        position="right"
        className={`fixed top-1/2 right-0 z-50 -translate-y-1/2 bg-white shadow transition-opacity duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
    </>
  )
}

export default RightDrawer
