import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Loading from "./Loading"

const IsAuthenticated = ({ ifTrue, ifFalse }) => {
    const [authenticated, setAutheticated] = useState(null)
    const navigate = useNavigate()

    axios.get('/auth/is-authenticated')
    .then(res => {
        if (res.data.authenticated != null) {
            setAutheticated(res.data.authenticated)
        } else {
            navigate(0) //refresh if something went wrong
        }
    })
    .catch(() => {
        navigate(0) //refresh if something went wrong
    })

    if (authenticated == true) {
        return(
            <>
                {ifTrue}
            </>
        )
    } else if (authenticated == false) {
        return(
            <>
                {ifFalse}
            </>
        )
    }
}

export default IsAuthenticated