/**
 * Created by LiYonglei on 2016/10/31.
 */
/*
* 抓取表单中所有的数据填充到json中
* warning:因为提交form-data类型的表单有更好的办法 https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest 所以这里只有非文件提交的写法
* 相同名称的字段会生成每个值以逗号分隔的字符串
* 比如
* <input type="checkbox" value=1 name="hobby"><input type="checkbox" value=2 name="hobby">
* 生成的数据为 {"hobby":"1,2"}
*params:{
*   $form 将要抓取的表单
* }
* */
function getFormData($form){
    var plainDatas = $form.serializeArray().reduce(function (privous, item) {
        var key = item.name;
        var value = item.value;
        if (privous[key]) {
            privous[key].push(value);
        } else {
            privous[key] = [value];
        }
        ;
        return privous;
    }, {});
    Object.keys(plainDatas).forEach(function (key) {
        plainDatas[key] = plainDatas[key].toString();
    });
    return plainDatas;
}
/*
* 向表单中填充数据
* 文件类型的不支持填充
* */
function fileFormData($form,data){
    Object.keys(data).forEach(function (key) {
        $("[name=" + key + "]",$form).val((data[key]+"").split(","));
    });
}
