import {cmiCatData} from "../config/labelData";

export function getClassifyMsgHttp(cmi_cat) { //获取分类id信息
    let cmi_catData = JSON.parse(JSON.stringify(cmiCatData));
    for (let i = 0; i < cmi_cat.length; i++) {
        // 女装 0
        if (cmi_cat[i].cat1_id === '10000019') {
            cmi_catData[0].list = cmi_cat[i].list.concat(cmi_catData[0].list);
        } else if (cmi_cat[i].cat1_id === '10000009') {
            cmi_catData[0].list = cmi_catData[0].list.concat(cmi_cat[i].list);
        }
        // 男装 1
        if (cmi_cat[i].cat1_id === '10000018') {
            cmi_catData[1].list = cmi_catData[1].list.concat(cmi_cat[i].list);
        }
        // 家居生活 3
        if (cmi_cat[i].cat1_id === '10000010') {
            cmi_catData[3].list = cmi_catData[3].list.concat(cmi_cat[i].list);
        } else if (cmi_cat[i].cat1_id === '10000022') {
            cmi_catData[3].list = cmi_catData[3].list.concat(cmi_cat[i].list);
        }
        // 包包&鞋子 4
        if (cmi_cat[i].cat1_id === '10000001') {
            cmi_catData[4].list = cmi_catData[4].list.concat(cmi_cat[i].list);
        }
        // 珠宝配饰 5
        if (cmi_cat[i].cat1_id === '10000025') {
            cmi_catData[5].list = cmi_cat[i].list.concat(cmi_catData[5].list);
        } else if (cmi_cat[i].cat1_id === '10000006') {
            cmi_catData[5].list = cmi_catData[5].list.concat(cmi_cat[i].list);
        } else if (cmi_cat[i].cat1_id === '10000029') {
            cmi_catData[5].list = cmi_catData[5].list.concat(cmi_cat[i].list);
        }
        // 户外运动 6
        if (cmi_cat[i].cat1_id === '10000024') {
            cmi_catData[6].list = cmi_catData[6].list.concat(cmi_cat[i].list);
        }
        for (let j = 0; j < cmi_cat[i].list.length; j++) {
            let cat2Data = cmi_cat[i].list[j];
            // 女装 0
            if (cat2Data.cat2_id === '20000051') {
                cmi_catData[0].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000127') {
                cmi_catData[0].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000060') {
                cmi_catData[0].list.push(cat2Data);
            }
            // 男装 1
            if (cat2Data.cat2_id === '20000261') {
                cmi_catData[1].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000218') {
                cmi_catData[1].list.push(cat2Data);
            }
            // 妈妈&儿童 2
            if (cat2Data.cat2_id === '20000160') {
                cmi_catData[2].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000491') {
                cmi_catData[2].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000494') {
                cmi_catData[2].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000493') {
                cmi_catData[2].list.push(cat2Data);
            }
            // 家居生活 3
            if (cat2Data.cat2_id === '20000219') {
                cmi_catData[3].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000018') {
                cmi_catData[3].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000133') {
                cmi_catData[3].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000138') {
                cmi_catData[3].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000179') {
                cmi_catData[3].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000257') {
                cmi_catData[3].list.push(cat2Data);
            } else if (cat2Data.cat2_id === '20000078') {
                cmi_catData[3].list.push(cat2Data);
            }
        }
    }

    return cmi_catData;
}