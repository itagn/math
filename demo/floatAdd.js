const MAX = Number.MAX_SAFE_INTEGER
const MIN = Number.MIN_SAFE_INTEGER
const intLen = `${MAX}`.length - 1  // 下面会频繁用到的长度 15

// 小数加法函数入口
function floatAdd(a = '0', b = '0') {
    const typeA = typeof(a), typeB = typeof(b)
    const allowTypes = ['number', 'string']
    if (!allowTypes.includes(typeA) || !allowTypes.includes(typeB)) {
        console.error('参数中存在非法的数据，数据类型只支持 number 和 string')
        return false
    }
    if (Number.isNaN(a) || Number.isNaN(b)) {
        console.error('参数中不应该存在 NaN')
        return false
    }
    const strA = `${a}`.split('.'), strB = `${b}`.split('.')
    let newA = strA[1], newB = strB[1]
    const maxLen = Math.max(newA.length, newB.length)
    const floatLen = Math.ceil(maxLen / intLen) * intLen
    newA = newA.padEnd(floatLen, '0')
    newB = newB.padEnd(floatLen, '0')
    newA = strA[0][0] === '-' ? `-${newA}` : newA
    newB = strB[0][0] === '-' ? `-${newB}` : newB
    let result = intCalc(newA, newB, false)
    let tag = true, numResult = Number(result)
    // 去掉正负数后面无意义的字符 ‘0’
    if (numResult !== 0) {
        if (numResult < 0) {
            result = result.slice(1)
            tag = false
        }
        result = result.length === floatLen ? `0.${result}` : `1.${result.slice(1)}`
        result = tag ? result : `-${result}`
        let index = result.length - 1
        while (result[index] === '0') {
            result = result.slice(0, -1)
            index--
        }
    } else {
        result = '0'
    }
    console.log(result)
    return result
}

/**
* @param { string } a 相加的第一个整数字符串
* @param { string } b 相加的第二个整数字符串
* @param { boolean } isInt 是否为真的整数计算
* @return { string } 返回相加的结果
*/
function intCalc(a, b, isInt = true) {
    let result = '0'
    const intA = Number(a), intB = Number(b)
    // 判断是否为安全数，不为安全数的操作进入复杂计算模式
    if (isSafeNumber(intA) && isSafeNumber(intB) && isSafeNumber(intA + intB)) {
        result = `${intA + intB}`
    } else {
        const sliceA = a.slice(1), sliceB = b.slice(1)
        if(a[0] === '-' && b[0] === '-') {
            // 两个数都为负数，取反后计算，结果再取反
            result = '-' + calc(sliceA, sliceB, true)
        } else if (a[0] === '-') {
            // 第一个数为负数，第二个数为正数的情况
            const newV = compareNumber(sliceA, b)
            if (newV === 1) {
                // 由于 a 的绝对值比 b 大，为了确保返回结果为正数，a的绝对值作为第一个参数
                result = '-' + calc(sliceA, b, false)
            } else if (newV === -1) {
                // 道理同上
                result = calc(b, sliceA, false)
            }
        } else if (b[0] === '-') {
            // 第一个数为正数，第二个数为负数的情况
            const newV = compareNumber(sliceB, a)
            if (newV === 1) {
                // 由于 b 的绝对值比 a 大，为了确保返回结果为正数，b的绝对值作为第一个参数
                result = '-' + calc(sliceB, a, false)
            } else if (newV === -1) {
                // 道理同上
                result = calc(a, sliceB, false)
            }
        } else {
            // 两个数都为正数，直接计算
            result = calc(a, b, true)
        }
    }
    // 去掉正负数前面无意义的字符 ‘0’
    if (isInt) {
        const numberResult = Number(result)
        if (numberResult > 0) {
            while (result[0] === '0') {
                result = result.slice(1)
            }
        } else if (numberResult < 0) {
            while (result[1] === '0') {
                result = '-' + result.slice(2)
            }
        } else {
            result = '0'
        }
    }
    return result
}


/**
* @param { string } a 相加的第一个整数字符串
* @param { string } b 相加的第二个整数字符串
* @param { string } type 两个参数是 相加（true） 还是相减（false）
* @return { string } 返回相加的结果
*/
function calc(a, b, type = true) {
    const arr = []  // 保存每个部分计算结果的数组
    for (let i=0; i<a.length; i+=intLen) {
        // 每部分长度 15 的裁取字符串
        const strA = a.slice(i, i + intLen)
        const strB = b.slice(i, i + intLen)
        const newV = Number(strA) + Number(strB) * (type ? 1 : -1)  // 每部分的计算结果，暂时不处理
        arr.push(`${newV}`)
    }
    let num = ''  // 连接每个部分的字符串
    for (let i=arr.length-1; i>=0; i--) {
        if (arr[i] > 0) {
            // 每部分结果大于 0 的处理方案
            const str = `${arr[i]}`
            if (str.length < intLen) {
                // 长度不足 15 的首部补充字符‘0’
                num = str.padStart(intLen, '0') + num
            } else if (str.length > intLen) {
                // 长度超过 15 的扔掉第一位，下一部分进位加一
                num = str.slice(1) + num
                if (i >= 1 && str[0] !== '0') arr[i-1]++
                else num = '1' + num
            } else {
                // 长度等于 15 的直接计算
                num = str + num
            }
        } else if(arr[i] < 0) {
            // 每部分结果小于 0 的处理方案，借位 10的15次方计算，结果恒为正数，首部填充字符‘0’到15位
            const newV =  `${10 ** intLen + Number(arr[i])}`
            num = newV.padStart(intLen, '0') + num
            if (i >= 1) arr[i-1]--
        } else {
            // 每部分结果等于 0 的处理方案，连续15个字符‘0’
            num = '0'.padStart(intLen, '0') + num
        }
    }
    return num
}


/**
* @param { number } num 需要检查的整数
* @return { boolean } 返回数字是否为安全的整数
*/
function isSafeNumber(num) {
    // 即使 num 成了科学计数法也能正确的和 MAX, MIN 比较大小
    return MIN <= num && num <= MAX
}


/**
* @param { string } a 比较的第一个整数字符串
* @param { string } b 比较的第二个整数字符串
* @return { boolean } 返回第一个参数与第二个参数的比较
*/
function compareNumber(a, b) {
    if (a === b) return 0
    if (a.length > b.length) {
        return 1
    } else if (a.length < b.length) {
        return -1
    } else {
        for (let i=0; i<a.length; i++) {
            if (a[i] > b[i]) {
                return 1
            } else if (a[i] < b[i]) {
                return -1
            }
        }
    }
}

// 测试用例
floatAdd('0.9037499254750994', '-0.9007299251310995')  // '0.0030200003439999'
floatAdd('0.8107499231750996', '-0.9007299254310995')  // '-0.0899800022559999'
floatAdd('-0.9907492547350994', '0.9007399254750995')  // '-0.0900093292599999'
floatAdd('0.9997492547350994', '0.9997399254750995')  // '1.9994891802101989'
floatAdd('-0.9997492547350994', '-0.9997399254750995')  // '-1.9994891802101989'
floatAdd('-0.4707494254750996000004254750996', '0.9707494254750996007299232150995')  // '0.5000000000000000007294977399999'
floatAdd('-0.4707494254750996900004254750996', '0.9707494254750996007299232150995')  // '0.4999999999999999107294977399999'
