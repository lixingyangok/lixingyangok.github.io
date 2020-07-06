import React from 'react';
import { useLocation } from 'react-router-dom';


export default function(){
    const oLocation = useLocation();
    console.log( oLocation );
    return <h1>
        About
    </h1>
}