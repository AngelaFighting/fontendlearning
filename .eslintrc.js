//ESLint 是在 ECMAScript/JavaScript 代码中识别和报告模式匹配的工具，它的目标是保证代码的一致性和避免错误。
module.exports = {
    //Environments - 指定脚本的运行环境。每种环境都有一组特定的预定义全局变量。
    "env": {
        "browser": true,
        "es6": true
    },
    //Globals - 脚本在执行期间访问的额外的全局变量。
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    //Rules - 启用的规则及其各自的错误级别。
    "rules": {
        //第一部分是规则名
        "indent": [
            "error",//第二部分是表示级别：0-不验证；1-警告；2-错误
            2
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};