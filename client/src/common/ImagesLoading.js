import { CircularProgress } from "@mui/material"
import { Box } from "@mui/system"
import React, { useEffect, useRef, useState } from "react"

const ImagesLoading = ({children, imagesAreLoading, imagesLoaded, setImagesLoaded}) => {
    var [imgChildren, setImgChildren] = useState()
    var childrenRef = useRef()
    
    useEffect(
        () => {
            var temp = Array.from(document.querySelectorAll('#images-loading-container img'))
            setImgChildren(temp)
            
            temp.forEach((child) => {
                child.addEventListener('load', () => {
                    setImagesLoaded((value => value+1))
                }) 
            })
        },
        [imagesAreLoading]
    )

    useEffect(
        () => {
            if (imgChildren){
                console.log(`imagesLoaded: ${imagesLoaded}, imgChildren.length: ${imgChildren.length}`)
                var flag = (imagesLoaded >= imgChildren.length && imagesAreLoading && imagesLoaded > 0)
                childrenRef.current.style.display = flag ? 'block' : 'none'
            }
        },
        [imagesLoaded, imagesAreLoading]
    )

    return (
        <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', minWidth:'100vw'}} id='images-loading-container'>
            <CircularProgress sx={{display: !imagesAreLoading || imagesLoaded < imgChildren.length || imagesLoaded == 0 ? 'block' : 'none'}}/>
            <div ref={childrenRef}>
                {children}
            </div>
        </Box>
    )
}

export default ImagesLoading