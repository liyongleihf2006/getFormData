/**
 * Created by LiYonglei on 2016/10/31.
 */
/*
* 抓取表单中所有的数据填充到json中
* 相同名称的字段会生成每个值以逗号分隔的字符串
* 比如
* <input type="checkbox" value=1 name="hobby"><input type="checkbox" value=2 name="hobby">
* 生成的数据为 {"hobby":"1,2"}
*文件类型的会以图片名称,图片类型,图片大小,图片数据提交
* 比如:<input type="file" name="headportrait" autocomplete="off" multiple>生成的数据为
* { "headportraitFileName": "dog.jpg,image_s.gif",
    "headportraitFileSize": "10923,338",
    "headportraitFileType": "image/jpeg,image/gif",
    "headportraitFile": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wB...ERBADs="
    }
*params:{
*   $form 将要抓取的表单
*   options:{
*       no_images:[] 不使用base64抓取文件的表单字段,就是非图片类型的文件
*   }
* }
* return :deferred 返回延迟对象 deferred.done(function(data){}) data 抓取到的表单数据
* */
function getFormData($form,options){
    options=options||{};
    var no_images=options.no_images||[];
    var deferred= $.Deferred();
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
    /*对于图片的操作*/
    /*
     * 是否上传了图片
     * */
    var hasImg = false;
    /*
     * 所有的文件总数
     * */
    var fileTotal = 0;
    /*
     * 已经读取完毕的文件的数量
     * */
    var currentFileTotal = 0;

    Array.prototype.forEach.call($(":file", $form), function (fileEl) {
        var fileData = {};
        Array.prototype.forEach.call(fileEl.files, function (file) {
            fileTotal++;
            var reader = new FileReader();
            reader.onloadstart = function () {
                hasImg = true;
            };
            reader.onload = function (oFREvent) {
                var data = oFREvent.target.result;
                currentFileTotal++;
                if (fileData[fileEl.name + "File"]) {
                    fileData[fileEl.name + "FileName"].push(file.name);
                    fileData[fileEl.name + "FileSize"].push(file.size);
                    fileData[fileEl.name + "FileType"].push(file.type);
                    fileData[fileEl.name + "File"].push(data);
                } else {
                    fileData[fileEl.name + "FileName"] = [file.name];
                    fileData[fileEl.name + "FileSize"] = [file.size];
                    fileData[fileEl.name + "FileType"] = [file.type];
                    fileData[fileEl.name + "File"] = [data];
                }
                ;
                if (currentFileTotal === fileTotal) {
                    Object.keys(fileData).forEach(function (key) {
                        fileData[key] = fileData[key].toString();
                    });
                    $.extend(plainDatas, fileData);
                    deferred.resolve(plainDatas);
                }
            };
            if($.inArray(fileEl.name,no_images)!==-1){
                reader.readAsBinaryString(file);
            }else{
                reader.readAsDataURL(file);
            }
        })
    });
    if (!hasImg) {
        deferred.resolve(plainDatas);
    }
    return deferred;
}
/*
* 向表单中填充数据
* 文件类型的不支持填充
* */
function fileFormData($form,data){
    Object.keys(data).forEach(function (key) {
        $("[name=" + key + "]",$form).val(data[key].split(","));
    });
}