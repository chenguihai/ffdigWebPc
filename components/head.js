import React, {Fragment} from 'react'
import NextHead from 'next/head'
import {string} from 'prop-types'

const Head = props => {
    return (
        <NextHead>
            <title>{props.title || '火联-网罗全球优品'}</title>

        </NextHead>
    )
};

Head.propTypes = {
    title: string,
    description: string,
    url: string,
    ogImage: string
};

export default Head
