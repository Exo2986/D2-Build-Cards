import React, { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

function Callback() {
    const navigate = useNavigate()

    const query = new URLSearchParams(useLocation().search)
    const code = query.get('code')

    const sendCallbackToAPI = () => {
        axios.get('/auth/callback', {
            params: {
                code: code
            }
        })
        .then((res) => {
            navigate('/auth')
        })
        .catch((err) => {
            navigate('/auth')
        })
    }

    useEffect(sendCallbackToAPI, [])

    return (
        <>
        </>
    )
}

export default Callback