import { Button, Dialog, DialogActions, DialogBody, DialogTitle } from '@vtfk/components'
import { useCallback, useEffect, useRef } from 'react'

export default function ConfirmationDialog ({ open, title, children, okBtnText, okBtnDisabled, cancelBtnText, onClickOk, onClickCancel, onDismiss, ...props }) {
  const handleOkClick = useCallback(() => {
    if (onClickOk && typeof onClickOk === 'function') onClickOk()
  }, [onClickOk])

  const listenForEnter = useCallback((e) => {
    if (e.key === 'Enter') {
      try {
        e.preventDefault()
        e.stopPropagation()
      } catch {}

      handleOkClick()
    }
  }, [handleOkClick])

  function handleCancelClick () {
    if (onClickCancel && typeof onClickCancel === 'function') onClickCancel()
  }

  const dialogRef = useRef(undefined)

  useEffect(() => {
    if (open) {
      dialogRef.current.focus()
      document.removeEventListener('keydown', listenForEnter)
      document.addEventListener('keydown', listenForEnter)
    } else {
      document.removeEventListener('keydown', listenForEnter)
    }
  }, [open, listenForEnter])

  useEffect(() => {
    return () => document.removeEventListener('keydown', listenForEnter)
    // eslint-disable-next-line
  }, [listenForEnter])

  return (
    <>
      <div ref={dialogRef}>
        <Dialog isOpen={open} onDismiss={() => { if (onDismiss && typeof onDismiss === 'function') onDismiss() }} {...props}>
          {title && <DialogTitle>{title}</DialogTitle>}
          <DialogBody>
            {children}
          </DialogBody>
          <DialogActions>
            <Button disabled={okBtnDisabled} size='small' onClick={() => handleOkClick()}>{okBtnText || 'Ok'}</Button>
            <Button size='small' onClick={() => handleCancelClick()}>{cancelBtnText || 'Lukk'}</Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  )
}
