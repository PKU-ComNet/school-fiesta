/**
 * Created by ProgrammerYuan on 16/5/18.
 */
var reds = require('./reds');
var natural = require('natural');
var fs = require('fs');
var util = require('util');

var file_list = [];
var word_prefix
var prefix = "./essays/"
var category_num = 3;
var category_size = 40;
var essayList = {}
var word_essay_table = {}
var tf_idf_list = []
var stem_dic = {};
var word_dic;

var init = function(){
    ["data_mining","architecture","machine_learning"].forEach(function(sub_name){
        for(var i = 1;i < category_size + 1;i++) {
            file_list.push(prefix + sub_name + i + ".txt");
        }
    });
}

var calcAllOneIDF = function(word) {
    return [1,1,1];
}

var calcNormIDF = function(word) {
    var ret = [];
    for(var i = 0;i < 3;i++)
        ret.push(Math.log(file_list.length / word_essay_table[word].length));
    return ret;
}

var calcNeoIDF = function(word) {
    var ret = [],category_index = 0,sum = 0,category_count = 0;
    word_essay_table[word].push(file_list.length + 1);
    for(var i in word_essay_table[word]) {
        while(word_essay_table[word][i] >= (category_index + 1) * category_size) {
            if(sum > 0) category_count++;
            ret.push(sum / category_size);
            category_index ++;
            sum = 0;
        }
        sum ++;
    }
    for(var i in ret) {
        ret[i] *= Math.log(category_num / category_count);
    }
    return ret;
}

var isDigit = function(str){
    var reg = /[0-9]+/;
    return reg.test(str);
}

var getAllForm = function (word) {
    var ret = "[";
    word = word.toLowerCase();
    for(var word_form in stem_dic[word]) {
        ret += word_form + ",";
    }
    ret += "]";
    return ret;
}

var process = function(file_path){
    data = fs.readFileSync(file_path,'utf-8');
    var words = reds.words(data);
    var word_stem;
    for(var i in words) {
        words[i] = words[i].toLowerCase();
        word_stem = natural.PorterStemmer.stem(words[i]);
        stem_dic[word_stem] = (stem_dic[word_stem] || {});
        stem_dic[word_stem][words[i]] = true;
        words[i] = word_stem;
    }
    words = reds.stripStopWords(words);
    var dic = {};
    var count = words.length;
    words.forEach(function(key){
        word = key.toUpperCase();
        if(!isDigit(word))
            dic[word] = (dic[word] || 0) + 1;
    });
    for(var key in dic) {
        word_essay_table[key] = (word_essay_table[key] || []);
        word_essay_table[key].push(file_list.indexOf(file_path));
    }
    var essayData = {}
    essayData.wordList = dic;
    essayData.wordCount = count;
    return essayData;
}

var processText = function(data){
    var words = reds.words(data);
    var word_stem;
    for(var i in words) {
        words[i] = words[i].toLowerCase();
        word_stem = natural.PorterStemmer.stem(words[i]);
        stem_dic[word_stem] = (stem_dic[word_stem] || {});
        stem_dic[word_stem][words[i]] = true;
        words[i] = word_stem;
    }
    words = reds.stripStopWords(words);
    var dic = {};
    var count = words.length;
    words.forEach(function(key){
        word = key.toUpperCase();
        if(!isDigit(word))
            dic[word] = (dic[word] || 0) + 1;
    });
    var essayData = {}
    essayData.wordList = dic;
    essayData.wordCount = count;
    return essayData;
}

var constructWordList = function() {
    init();
    var file_path;
    for (var i in file_list) {
        file_path = file_list[i];
        essayList[file_path] = process(file_path);
    }
    var tf,sum,sum_total,category_index;
    var word_object = {};
    for(var word in word_essay_table) {
        word_essay_table[word] = calcNeoIDF(word);//idf calculating
        sum = 0;
        sum_total = 0;
        category_index = 0;
        word_object = {};
        word_object.word = word;
        //word_object.value_array = [];
        word_object.category_value = [];
        for (var i  = 0;i < file_list.length;i++) {
            file_path = file_list[i];
            tf = (essayList[file_path].wordList[word] || 0) / essayList[file_path].wordCount;
            if(i >= (category_index + 1) * category_size)
                category_index ++;
            sum += tf * word_essay_table[word][category_index];
            //word_object.value_array.push(tf * word_essay_table[word]);//tf-idf calculating
            if((i + 1) % category_size == 0){
                word_object.category_value.push(sum / category_size);
                sum = 0;
            }
        }
        sum = 0;
        for(var i = 0;i < 3;i++)
            sum += word_object.category_value[i];
        word_object.tf_idf_sum = sum / 3;
        tf_idf_list.push(word_object);
    }
    tf_idf_list.sort(function(word_object1,word_object2){
        var sum1 = word_object1.tf_idf_sum;
        var sum2 = word_object2.tf_idf_sum;
        if (sum1 < sum2) {
            return 1;
        } else if (sum1 > sum2) {
            return -1;
        } else {
            return 0;
        }
    });
    var output = {}
    fs.writeFileSync("word_list.txt","","utf-8");
    for(var i in tf_idf_list) {
        fs.appendFileSync("word_list.txt",util.format("%s:%s\n",getAllForm(tf_idf_list[i].word),tf_idf_list[i].tf_idf_sum),'utf-8');
        output[tf_idf_list[i].word] = tf_idf_list[i];
    }
    fs.writeFileSync("word_dic.txt",JSON.stringify(output),'utf-8');
    var peak_count = [0,0,0],index = 0;
    var key_word_list = [];
    var flag = false;
    var kk = 20;
    while(peak_count[0] < kk || peak_count[1] < kk || peak_count[2] < kk/**/) {
        word = tf_idf_list[index].word;
        flag = false;
        for(var i in word_essay_table[word]) {
            if (peak_count[i] < kk && word_essay_table[word][i] > 0) {
                peak_count[i]+= word_essay_table[word][i];
                flag = true;
            }
        }
        if(flag) key_word_list.push(word);
        index++;
    }
    fs.writeFileSync("key_word_list3.txt","","utf-8");
    for(var i in key_word_list) {
        fs.appendFileSync("key_word_list3.txt",key_word_list[i] + '\n','utf-8');
    }
    var essay_vector,vectors = [];
    fs.writeFileSync("essay_vectors3.txt","","utf-8");
    for(var i in file_list) {
        essay_vector = [];
        for(var  j in key_word_list) {
            essay_vector.push((essayList[file_list[i]].wordList[key_word_list[j]] || 0) / essayList[file_list[i]].wordCount);
        }
        vectors.push(essay_vector);
    }

    for(var i = 0;i < category_size;i++) {
        for(var j = 0;j < category_num;j++) {
            fs.appendFileSync("essay_vectors3.txt",vectors[j * category_size + i] + '\n',"utf-8");
        }
    }

    for(var i in file_list) {
        file_path = file_list[i];
        test = [0,0,0];
        for(var j in essayList[file_path].wordList) {
            for(var k = 0;k < 3;k++){
                test[k] = word_essay_table[j][k];
            }
        }
        var max = 0,index = 0;
        for(var j in test){
            if(test[j] > max) {
                max = test[j];
                index = j;
            }
        }
        console.log(index);
    }
}

var initWordList = function(){
    word_dic = JSON.parse(fs.readFileSync('./word_dic.txt','utf-8'));
}

function arrayMax(arr) {
    var len = arr.length - 1, max = -Infinity,index;
    while (len >= 0) {
        if (arr[len] > max) {
            max = arr[len];
            index = len;
        }
        len--;
    }
    return index;
};

var predictCategory = function(str){
    if(word_dic == null) initWordList();
    data = processText(str);
    var ret = [0,0,0];
    for(var word in data.wordList) {
        for (var i = 0;i<3;i++) {
            ret[i] += word_dic[word].category_value[i];
        }
    }
    console.log(ret);
    return arrayMax(ret);
}

var reprintKeyWordList = function () {
    data = fs.readFileSync('key_word_list.txt','utf-8');
    var words = reds.words(data);
    fs.writeFileSync("new_key_word_list.txt","","utf-8");
    for(var i = 0;i < words.length;i++) {
        fs.appendFileSync("new_key_word_list.txt",words[i].toLowerCase() + ' ','utf-8');
        if((i + 1) % 8 == 0) {
            fs.appendFileSync("new_key_word_list.txt",'\n','utf-8');
        }
    }
}

var generateEssayVector = function () {
    data = fs.readFileSync('key_word_list.txt','utf-8');
    var words = reds.words(data);
    var test_list = ['test_data_mining_2.txt','test_machine_learning2.txt','test_system_architecture1.txt'];
    var essay_data = {};
    var file_path;
    for(var i in test_list) {
        file_path = test_list[i];
        essay_data[file_path] = process(prefix + file_path);
    }
    fs.writeFileSync("essay_vectors.txt","","utf-8");
    for(var i in test_list) {
        essay_vector = [];
        for(var  j in words) {
            essay_vector.push((essay_data[test_list[i]].wordList[words[j]] || 0) / essay_data[test_list[i]].wordCount);
        }
        fs.appendFileSync("essay_vectors.txt",essay_vector + '\n',"utf-8")
    }
}

var generateTextVector = function (strlist) {
    data = fs.readFileSync('key_word_list3.txt','utf-8');
    var words = reds.words(data);
    fs.writeFileSync("essay_vectors_program.txt","","utf-8");
    var essay_data = {};
    for(var i in strlist) {
        essay_data[i] = processText(strlist[i])
    }
    var ret = [];
    for(var i in strlist) {
        essay_vector = [];
        for(var  j in words) {
            essay_vector.push((essay_data[i].wordList[words[j]] || 0) / essay_data[i].wordCount);
        }
        ret.push(essay_vector);
        fs.appendFileSync("essay_vectors_program.txt",essay_vector + '\n',"utf-8")
    }
    return ret;
}
exports.essayList = essayList;
exports.predictCategory = predictCategory;
exports.reprintKeyWordList = reprintKeyWordList;
exports.process = process;
exports.initKeywordList=initWordList;
exports.generateTextVector = generateTextVector;
exports.generateEssayVector = generateEssayVector;
exports.run = constructWordList;
