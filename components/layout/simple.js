import React from 'react'
import Head from "../../components/head";
import Header from '../../components/Header'
import NavLeft from "../NavLeft";
import './index.less'

export default function JWPLayoutSimple({children, title}) {
    return (
        <div style={{background: '#f8f8f8'}}>
            {/*<Row className="container">*/}
            {/*<Col xs={24} style={{marginBottom: 20}}><BgHeader/></Col>*/}
            {/*<Col xll={2} xl={3} lg={4} md={5} sm={0} xs={0} className="nav-left">*/}
            {/*<NavLeft/>*/}
            {/*</Col>*/}
            {/*<Col xll={22} xl={21} lg={20} md={19} sm={24} xs={24} className="main">*/}
            {/*<Layout.Content>*/}
            {/*{children}*/}
            {/*</Layout.Content>*/}
            {/*</Col>*/}
            {/*</Row>*/}
            <Head title={title}/>
            <Header/>
            <section className="contentBgWrap">
                <NavLeft/>
                <div className="rightBgWrap">{children}</div>
            </section>
        </div>
    )
}
