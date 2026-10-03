"use client";
import { useEffect, useEffectEvent, useRef } from "react";
import { FiX } from "react-icons/fi";

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const dialogRef = useRef(null);

  const onEventClose = useEffectEvent(() => {
    onClose?.();
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event) => {
      event.preventDefault();
      onEventClose();
    };

    const handleClick = (event) => {
      if (event.target === dialog) {
        onEventClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 m-auto flex h-full max-h-full w-full max-w-full items-center justify-center border-none bg-transparent p-4 outline-none backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div
        className={`w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <h3
            id="modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
};

export default Modal;
