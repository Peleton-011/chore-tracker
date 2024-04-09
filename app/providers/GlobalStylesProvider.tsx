"use client"

import React from 'react'
import styled from 'styled-components'

interface Props{
    children : React.ReactNode
}

function GlobalStylesProvider({children} : Props) {
  return <GlobalStyles>{children}</GlobalStyles>;
}

const GlobalStyles = styled.div`
    background-color: red;
`

export default GlobalStylesProvider