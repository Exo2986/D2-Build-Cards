import { Alert, Snackbar } from "@mui/material"
import { useEffect, useImperativeHandle, useRef, useState } from "react"

const AlertSnackbar = ({timeout, message, alertLevel, referenceValue}) => {
    const [open, setOpen] = useState(false)

    const openSnackbar = () => {
        if (!referenceValue)
            setOpen(true)
    }

    const closeSnackbar = () => {
        setOpen(false)
    }

    //This is a weird little hack. Basically, the problem is that JavaScript captures variable values for timeout callbacks when the timeout is defined.
    //In this case, the captured value for referenceValue used in openSnackbar() is caught during the on mount effect, when the timeout is started.
    //This means that no matter what, the referenceValue will always be false. To stop this, we use this ref and add an onTimeout hook that we can call when the timeout
    //is over. This causes the referenceValue variable to be captured again.
    const ref = useRef()
    useImperativeHandle(ref, () => ({
        onTimeout: () => openSnackbar()
    }))

    useEffect(() => {
        if (timeout <= 0)
            openSnackbar()
        else {
            const timer = setTimeout(() => ref?.current?.onTimeout(), timeout)
            
            return () => clearTimeout(timer)
        }
    }, [])

    return (
        <Snackbar open={open} autoHideDuration={10_000} onClose={closeSnackbar}>
            <Alert severity={alertLevel} onClose={closeSnackbar}>{message}</Alert>
        </Snackbar>
    )
}

export default AlertSnackbar