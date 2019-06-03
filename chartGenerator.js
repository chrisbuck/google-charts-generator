google.charts.load('current', {
  callback: drawStuff,
  packages:['corechart', 'controls', 'table']
});

var Charts = new Charts();

var controlsDiv = null;
var dataTbl = null;
var displayTbl = null;
var listData = null;
var colArray = [];
var colKeys = [];
var rowKeys = [];
var chartElems = [];
var chartParams = [];
var chartsArr = [];
var controlParams = [];
var controls = [];
var mainWrap = null;
var mainTable = null;

var tableOptions = {
    allowHtml: true,
    cssClassNames: {
        headerRow: 'headerRow',
        tableRow: 'tableRow',
        oddTableRow: 'oddTableRow',
        selectedTableRow: 'selectedTableRow',
        headerCell: 'headerCell',
        tableCell: 'tableCell'
    },
    height: '100%'
};
var pieOptions = {
    chartArea: {
        top: 15,
        left: 0,
        width: 360,
        right: 0,
        height: 360,
        bottom: 15
    },
    //width: 290,
    //height: 220,
    //chartArea: {'left': 20, 'top': 20, 'right': 0, 'bottom': 0},
    pieSliceText: 'value',
    pieHole: 0.4,
    legend: {position: 'left', textStyle: {color: 'black', fontSize: 9, fontName: 'Garamond' }},
    pieSliceBorderColor: 'Black',
    
};


String.prototype.replaceAll = function(findStr, replaceStr){
	var output = this;
	var exp = new RegExp(findStr, 'g');

	output = output.replace(exp, replaceStr);

	return output;
}
function getDefaultOptions(type){
    var opts = null;
    switch( type ){
        case 'Table':
            opts = tableOptions;
            break;
        case 'PieChart':
            opts = pieOptions;
            break;
        default:
            console.log('Warning: Options for this chart type have not been setup yet. Displaying as table.')
            opts = tableOptions;
            break;
    }
    return opts;
}
function getFormatPattern(str, dTbl){
    var calcStr = str;
    if(dTbl == undefined){
        dTbl = dataTbl;
    }
        
        var output = '';
        var workingStr = '';
        workingStr += calcStr;
        var lblIndex = null;
        var val = '';
        var bracket = '';
        var openPos = -1;
        var closePos = -1;
        var sub = '';
        var unbracket = '';
        var paramStrings = [];
        var params = [];
        
        while( workingStr.indexOf('{') > -1 ){
            openPos = workingStr.indexOf('{');
            if( openPos == -1 ){
                break;
            }
            sub = workingStr.substr(0, openPos);
            output += sub;
            workingStr = workingStr.replace(sub, '');
            closePos = workingStr.indexOf('}');
            bracket = workingStr.substr(0, closePos + 1);
            paramStrings.push(bracket);
            unbracket = bracket.replace('{','');
            unbracket = unbracket.replace('}','');
            var colInd = dTbl.getColumnIndex(unbracket);
            if( params.indexOf(colInd) == -1 ){
                params.push(colInd);
            }
            workingStr = workingStr.replace(bracket, '');
            workingStr = workingStr.replaceAll('undefined', '');
        }
        
        var outputStr = calcStr;
        for(var p = 0; p < paramStrings.length; p++ ){
            var itmStr = paramStrings[p];
            var lbl = itmStr.replace('{','');
                lbl = lbl.replace('}','');
            var indVal = dTbl.getColumnIndex(lbl);
            var pos = params.indexOf(indVal);
            outputStr = outputStr.replace('{' + lbl + '}', '{' + pos + '}');
        }
    
    var outputObj = {
        formattedPattern: outputStr,
        params: params
    };
    return outputObj;
  
}
function getStringPattern(str, dTbl, row){
  if(str !== undefined ){
    var output = '';
    var workingStr = '';
    workingStr += str;
    var lblIndex = null;
    var val = '';
    var bracket = '';
    var openPos = -1;
    var closePos = -1;
    var sub = '';
    var unbracket = '';
    while( workingStr.indexOf('{') > -1 ){
      openPos = workingStr.indexOf('{');
      if( openPos == -1 ){
        break;
      }
      sub = workingStr.substr(0, openPos);
      output += sub;
      workingStr = workingStr.replace(sub, '');
      closePos = workingStr.indexOf('}');
      bracket = workingStr.substr(0, closePos + 1);
      workingStr = workingStr.replace(bracket);
      unbracket = bracket.replace('{','');
          unbracket = unbracket.replace('}','');
          unbracket = unbracket;
      
      lblIndex = dTbl.getColumnIndex(unbracket);
      val = dTbl.getValue(row, lblIndex);
      val = String(val);
      val = val.replace('undefined', '');
      output += val.replace('undefined', '');
      
    }
    if(workingStr.length > 0){
      output += workingStr;
    }
    
    return output;
  }
}
function getValidDate(str){
  var dateStr = str;
  var output = null;
  var dateObj = new Date(dateStr);
  if(checkIfDateNotValid(dateObj)){
    dateStr = str.replace(' ', ''); //Reformat string if containing a space before timezone (e.g., "2014-12-30T10:13:32 +05:00")
    var fixedDate = new Date(dateStr);
    output = fixedDate;
  } else {
    output = dateObj;
  }
  return output;
}
function checkIfDateNotValid(d) {
    try{
        var d = new Date(d);
        return !(d.getTime() === d.getTime()); //NAN is the only type which is not equal to itself.
    }catch (e){
        return true;
    }
}
function insertTableTitles(){
    jQuery(document).ready(function($){
        setTimeout(function(){
        var tables = $('[data-charttype=table]');
        for( var t = 0; t < tables.length; t++ ){
            var tbl = tables[t];
            var title = $(tbl).data('title');
            if( title !== undefined ){
                var tblId = tbl.id;
                var tblHead = $('#' + tblId + ' thead');
                var tblCols = $(tblHead).find('th');
                var colCnt = tblCols.length;
                console.log(colCnt);
                var rowStr = '<tr class="titleRow"><td class="titleCell" colspan="' + colCnt + '">'+title+'</td></tr>';
                tblHead.prepend(rowStr);
            }
        }
        },100);
    });
}
function properCase(str){
    var output = '';
    var first = str[0];
    var second = str.slice(1, str.length);
    first = first.toUpperCase();
    output = first + second;
    return output;
}
function setChartElems(){
    var charts = $('.gChart');
    if( chartElems.length < 1 ){
        for( var c = 0; c < charts.length; c++ ){
            var chartElem = charts[c];
            chartElems.push(chartElem);
        }
    }
}
function setCalcSourceColumn(calcParams){
    var calcType = calcParams.calcType;
    var lbl = calcParams.label;
    var dispose = calcParams.disposition;
    var pattern = calcParams.pattern;
    
    var obj = {
        dataType: 'calc',
        type: calcType,
        label: lbl,
        id: 'calc_' + lbl
    }
    
    dataTbl.addColumn(obj);
    
    var formatSpecs = getFormatPattern(pattern, dataTbl);
    
    var formatStr = formatSpecs.formattedPattern;
    var formatArr = formatSpecs.params;
    var formatter = new google.visualization.PatternFormat(formatStr);
    formatter.format(dataTbl, formatArr);    
}
function getCalculatedColumn(calcParams){
    var calcType = calcParams.calcType;
    var lbl = calcParams.label;
    var dispose = calcParams.disposition;
    var pattern = calcParams.pattern;
    var calc = function(dTbl, row){
        var str = getStringPattern(pattern, dTbl, row);
        str = str.replaceAll('undefined', '');
        console.log(str);
        return str;
    };
    var obj = {
        dataType: 'calc',
        type: calcType,
        label: lbl,
        id: 'calc_' + lbl,
        calc: calc
    };
    return obj;
}
function getCalculatedColumns(chartElem){
    var output = [];
    var chartId = chartElem.id;
    var dataCols = $('#' + chartId + ' .dataColumns').find('div');
    for( var d = 0; d < dataCols.length; d++ ){
        var itm = dataCols[d];
        var dataType = $(itm).data('type');
        if( dataType == 'calc' ){
            var lbl = $(itm).data('label');
            var calcType = $(itm).data('calctype');
            var dispose = $(itm).data('calcdispose');
            var calcStr = itm.innerHTML;
            var obj = {};
                obj.type = calcType;
                obj.dataType = 'calc';
                obj.label = lbl;
                obj.disposition = dispose;
                obj.pattern = calcStr;
            output.push(obj);
        }
    }
    return output;
}
function getDataCols(chartElem){
    var output = [];
    var chartId = chartElem.id;
    var dataCols = $('#' + chartId + ' .dataColumns').find('div');
    for( var d = 0; d < dataCols.length; d++ ){
        var itm = dataCols[d];
        var dataKey = itm.id;
        var dataType = $(itm).data('type');
            output.push(dataKey);
    }
    return output;
}
function getDataColumnIds(chartElem){
    var output = [];
    var chartId = chartElem.id;
    var dataCols = $('#' + chartId + ' .dataColumns').find('div');
    for( var d = 0; d < dataCols.length; d++ ){
        var itm = dataCols[d];
        var dataKey = itm.id;
        var dataType = $(itm).data('type');
        if( dataType !== 'calc' ){
            output.push(dataKey);
        }
    }
    return output;
}
function getHiddenDataColumns(chartElem){
    var output = [];
    var chartId = chartElem.id;
    var dataCols = $('#' + chartId + ' .dataColumns').find('div');
    for( var d = 0; d < dataCols.length; d++ ){
        var itm = dataCols[d];
        var vis = $(itm).attr('visibility');
        if( vis == 'hidden' ){
            output.push(itm.id);
        }
    }
    return output;
}
function getVisibleChartColumns(params){
    var output = [];
    console.log(params);
    var chartType = params.chartType;
    var visKeys = params.dataKeys;
    var hideKeys = params.hiddenKeys;
    var dataTypes = params.dataTypes;
    for( var v = 0; v < visKeys.length; v++ ){
        var visKey = visKeys[v];
        if( hideKeys.indexOf(visKey) == -1 ){
            var visIndex = dataTbl.getColumnIndex(visKey);
            var dataType = dataTypes[v];
            output.push(visIndex);
        }
    }
    
    var calcCols = params.calcCols;
    if( calcCols !== undefined ){
        for( var c = 0; c < calcCols.length; c++ ){
            var calcParams = calcCols[c];
            var calcType = calcParams.type;
            var lbl = calcParams.label;
            var dispose = calcParams.disposition;
            var pattern = calcParams.pattern;
            var calc = function(dTbl, row){
                var str = getStringPattern(pattern, dTbl, row);
                str = str.replaceAll('undefined', '');
                return str;
            };
            var obj = {
                type: calcType,
                label: lbl,
                id: 'calc_' + lbl,
                calc: calc
            };
            output.push(obj);
        }
    }
    
    console.log(output);
    return output;
}
function getDataTypes(chartElem){
    var output = [];
    var dataCols = $(chartElem).find('.dataColumns div');
    for( var d = 0; d < dataCols.length; d++ ){
        var col = dataCols[d];
        var colType = $(col).data('type');
        if( colType !== 'calc' ){
            output.push(colType);
        }
    }
    return output;
}
function setChartParams(){
    for( var c = 0; c < chartElems.length; c++ ){
        var chartElem = chartElems[c];
        var chartClasses = chartElem.classList;
        var isMainTable = false;
        for(var i = 0; i < chartClasses.length; i++){
            var classStr = chartClasses[i];
            if( classStr == 'mainTable' ){
                isMainTable = true;
            }
        }
        var chartObj = {};
        var chartType = $(chartElem).data('charttype');
        
        if( chartType !== 'table' ){
            chartType = properCase(chartType) + 'Chart';
        } else {
            chartType = properCase(chartType);
        }
        var chartId = chartElem.id;
        var chartTitle = $(chartElem).data('title');
        chartObj.chartType = chartType;
        chartObj.chartId = chartId;
        chartObj.isMain = isMainTable;
        chartObj.dataKeys = getDataCols(chartElem);
        chartObj.dataTypes = getDataTypes(chartElem);
        chartObj.hiddenKeys = getHiddenDataColumns(chartElem);
        chartObj.title = undefNull(chartTitle);
        chartParams.push(chartObj);
    }
}
function setColArray(){
    if(colArray.length < 1 ){
        var cols = $('.dataColumns').find('div');
        var c = 0;
        var cnt = cols.length;
        for( c = 0; c < cnt; c++ ){
            var obj = {};
            var col = cols[c];
            var colId = col.id;
            var colType = $(col).data('type');
            var colLbl = $(col).data('label');
            var colWidth = $(col).attr('width');
            var colKeyStr = $(col).data('key');
            var colKey = null;
            if( colKeyStr !== undefined ){
                colKey = colKeyStr;
            } else {
                colKey = colLbl;
            }
            
            if( colKeys.indexOf(colKey) == -1 ){
            var colClasses = col.classList;
            var classArr = null;
            if( colClasses.length > 0 ){    //each will have the chartCol class
                classArr = [];
                for( var i = 0; i < colClasses.length; i++ ){
                    var colClass = colClasses[i];
                    classArr.push(colClass);
                }
            }
            
            //Calculated
            var colForm = null;
            if( colType == 'calc' ){
              var colPattern = $(col).html();
              var calcDispose = $(col).data('calcdispose');
              var calcType = $(col).data('calctype');
              if( colPattern.length > 0 ){
                colForm = {};
                colForm.label = colLbl;
                colForm.pattern = colPattern;
                colForm.calcType = undefNull(calcType);
                colForm.disposition = undefNull(calcDispose);
              }
            }
            
            var colVis = $(col).attr('visibility');
            
            obj['type'] = colType;
            obj['id'] = colId;
            obj['label'] = colLbl;
            obj['width'] = undefNull(colWidth);
            obj['key'] = colKey;
            obj['classes'] = classArr;
            obj['calculation'] = colForm;
            obj['visibility'] = undefNull(colVis);
            
            colKeys.push(colKey);
            colArray.push(obj);
            }
        }
    }
}
function setControlsArray(){
    var controlElems = controlsDiv.find('div');
    for( var c = 0; c < controlElems.length; c++ ){
        var control = controlElems[c];
        var controlObj = {};
        var controlLbl = $(control).data('label');
        var controlDataType = $(control).data('type');
        var controlType = $(control).data('controltype');
        var filterId = control.id;
        controlObj.label = controlLbl;
        controlObj.dataType = controlDataType;
        controlObj.type = controlType;
        controlObj.filterId = filterId;
        controlParams.push(controlObj);
    }
}
function setControlsDiv(){
    controlsDiv = $('#dashboard .dashControls');
}
function setDataColumn(params, tbl){
    var data = tbl;
    var type = params.type;
    var label = params.label;
    var id = params.id;
                //var role = params[3];
                //var pObj = params[4];
    var addObj = {};
    if(type !== undefined && type !== null){
        addObj.dataType = type;
        addObj.type = type;
    }
    if(label !== undefined && label !== null){
        addObj.label = label;
    }
    if(id !== undefined && id !== null){
        addObj.id = id;
    }
                /*
                if(role !== undefined && role !== null){
                    addObj.role = role;
                }
                if(pObj !== undefined && pObj !== null){
                    addObj.p = pObj;
                    //var style = pObj.style;
                }
                */
    data.addColumn(addObj);
}
function setDataColumns(){
    var colCnt = colArray.length;

    for( var c = 0; c < colCnt; c++ ){
        var itm = colArray[c];
        if(itm.type !== 'calc' ){
            if( itm.type == 'number' ){
              setDataColumn(itm, dataTbl);
              var ind = dataTbl.getColumnIndex(itm.label);
            } else {
              setDataColumn(itm, dataTbl);
            }
        } else {
            var calcParams = itm.calculation;
            setCalcSourceColumn(calcParams);
        }
    }
}
function setEndpoint(){
    var output = null;
    var endpointAnchor = $('a.endpoint');
    endpointAnchor = endpointAnchor[0];
    if( endpointAnchor !== undefined ){
        output = endpointAnchor.href;
    }
    endpoint = output;
}
function setDataFromAPI(){
    var listPromise = new Promise(function(resolve, reject){
        $.ajax(
            endpoint,
            {
                type: 'GET',
                headers: {
                accept: "application/json;odata=verbose"
                },
                success: function(data){
                    var results = data.d.results;
                    resolve(results);
                }
            }
        );
    });
    //Make sure the ajax call returned results.
    listPromise.then(function(results){
        listData = results;
        return listData;
    }).then(function(listData){
        listData = reKeyList(listData);
        retrievedData = listData;
        //processAPI(listData);
        return listData;
    });
}
function setDataFromSample(){
    var listPromise = new Promise(function(resolve, reject){
        resolve(sampledata);
    });
    //Make sure the ajax call returned results.
    listPromise.then(function(results){
        listData = results;
        return listData;
    }).then(function(listData){
        listData = reKeyList(listData);
        retrievedData = listData;
        //processAPI(listData);
        return listData;
    });
}
function setListData(){
    var pathUrl = window.location.href;
    if( pathUrl.indexOf('index.html') > -1 || pathUrl.indexOf('plnkr.co') > -1){
        setDataFromSample();
    } else {
        setDataFromAPI();
    }
}
function setRowKeys(){
    for( var i = 0; i < colArray.length; i++ ){
        var colItm = colArray[i];
        var colType = colItm.type;
        if( colType !== 'calc' ){
          var rowKey = colItm.key;
          rowKeys.push(rowKey);
        }
    }
}
function undefNull(val){
    if( val == undefined ){
        return null;
    } else {
        return val;
    }
}
function waitForVal(lbl, callback){
    if (window[lbl]) {
      callback();
    } else {
      Object.defineProperty(window, lbl, {
        configurable: true,
        enumerable: true,
        get: function() {
          return this['_' + lbl];
        },
        set: function(val) {
          this['_' + lbl] = val;
          callback();
        }
      });
    }
}
function validString(str){
    var working = '';
    if(str == undefined ){
        working = '↵                <a data-brackets-id="165" class="calcLink" href="mailto:carmellarich@aquasseur.com">carmellarich@aquasseur.com</a>↵              ';
    } else {
        working = str;
    }
    working = working.replaceAll(String.fromCharCode(8629),'');
    working = trimDown(working);
    return working;
}
function trimDown(str){
    var working = str;
    var firstValid = false;
    
    while( firstValid == false ){
        if( working.charCodeAt(0) !== 32 ){
            firstValid = true;
            break;
        } else {
            working = working.trim();
        }
    }
        
    var lastValid = false;
    var pos = working.length - 1;
    
    while( lastValid == false ){
        pos = working.length - 1;
        if( working.charCodeAt(pos) !== 32 ){
            lastValid = true;
            break;
        } else {
            working = working.trim();
        }
    }
    
    return working;
}

function resetCalcColumns(tbl){
    var data = tbl;
    var colCnt = colArray.length;
    for( var c = 0; c < colCnt; c++ ){
        var itm = colArray[c];
        if( itm == undefined ){
            return;
        }
        var colId = itm.id;
        var colType = itm.type;
        if( colType == 'calc' ){
            //replaceCalcCol
            var calcParams = itm.calculation;
            var dataType = calcParams.calcType;
            var pattern = calcParams.pattern;
            data.insertColumn(c, {
                dataType: 'number',
                type: dataType,
                label: colId,
                id: colId,
                p: {
                    replacement: true
                }
            });
            var formatSpecs = getFormatPattern(pattern, data);
            var formatStr = validString(formatSpecs.formattedPattern);
            var formatArr = formatSpecs.params; 
            var formatter = new google.visualization.PatternFormat(formatStr);
            formatter.format(data, formatArr, c);
            var rowCnt = data.getNumberOfRows();
            for(var r = 0; r < rowCnt; r++ ){
                var val = data.getFormattedValue(r, c);
                data.setValue(r, c, val);
            }
            var oldIndex = null;
            var colCnt = data.getNumberOfColumns();
            for( var i = 0; i < colCnt; i++ ){
                
            }
            var oldIndex = null;
            var colCnt = data.getNumberOfColumns();
            for(var c = 0; c < colCnt; c++ ){
                var colLbl = data.getColumnLabel(c);
                var isOrig = data.getColumnProperty(c, 'replacement');
                if( colLbl == colId || colId == colLbl.replace(' ', '')){
                    if(isOrig !== true){
                    oldIndex = c;
                    }
                }
            }
            data.removeColumn(oldIndex);
        }
        //var colIndex = data.getColumnIndex(colId);
    }
    return data;
}
function firstColumnString(tbl){
    var data = tbl;
    var colType = data.getColumnType(0);
    var colLbl = data.getColumnLabel(0);
    if( colType == 'number' ){
        data.insertColumn(0, {
            type: 'string',
            label: colLbl,
            id: 'firstStringColumn'
        });
        var formatter = new google.visualization.PatternFormat('{0}');
        formatter.format(data, [1], 0);
        var rowCnt = dataTbl.getNumberOfRows();
        for(var r = 0; r < rowCnt; r++ ){
            var rawVal = data.getFormattedValue(r, 0);
            data.setValue(r, 0, String(rawVal));
        }
    }
    return data;
}
function reKeyList(){
    //ToDo: Needs to be regex.
    var i = 0;
    for(i in listData){
        var apiItm = listData[i];
        var k = 0;
        for(k in apiItm){
            var key = k;
            if(key !== null){
                var oldKey = key;
                var newKey = oldKey.replace('_x0020_',' ');
                    newKey = newKey.replace('_x0020','');
                    newKey = newKey.replace('_x0023_','#');
                    newKey = newKey.replace('_x0028_','(');
                    newKey = newKey.replace('_x0029_',')');
                    newKey = newKey.replace('_x002','%)');
                    newKey = newKey.replace('_x0','');
                    newKey = newKey.replace('_',' ');
                
                /* newKey = newKey.replace('_x0028_','(');
                newKey = newKey.replace('_x0029_',')');
                newKey = newKey.replace('_x002','%)');
                newKey = newKey.replace('_x00',')');
                newKey = newKey.replace('_x0',')');
                */
                var itmVal = apiItm[oldKey];

                if (oldKey !== newKey) {
                    Object.defineProperty(apiItm, newKey,
                        Object.getOwnPropertyDescriptor(apiItm, oldKey));
                    delete apiItm[oldKey];
                }
            }
        }
    }
    
    return listData;
}
function setControls(data){
    //For each item in control params, create control
    for( var c = 0; c < controlParams.length; c++ ){
        var itm = controlParams[c];
        var type = properCase(itm.type) + 'Filter';
        var filterId = itm.filterId;
        var filterLbl = itm.label;
        var filter = new google.visualization.ControlWrapper({
            controlType: type,
            containerId: filterId,
            options: {
                //filterColumnLabel: filterLbl,
                filterColumnIndex: data.getColumnIndex(filterLbl),
                ui: {
                    labelStacking: 'vertical'
                }
            }
        });
        controls.push(filter);
    }
}
function getPieRows(params){
    
}
function getTableRows(params){
    
}
function getVisRows(params){
    var output = [];
    var chartType = params.chartType;
    if( chartType == 'PieChart' ){
        output = getPieRows(params);
    } else if ( chartType == 'Table' ){
        output = getTableRows(params);
    }
    return output;
}
function getPieCols(params){
    var output = [];
    var dataKeys = params.dataKeys;
    var dataTypes = params.dataTypes;
    var firstKey = dataKeys[0];
    var firstType = dataTypes[0];
    var firstInd = dataTbl.getColumnIndex(firstKey);
    
    var key = '';
    var ind = null;
    
    if( firstType == 'number' && firstInd == 1 ){
        key = 'firstStringColumn';
        ind = dataTbl.getColumnIndex(key);
    } else {
        key = firstKey;
        ind = firstInd;
    }
    
    output.push(ind);
    var calcObj = {};
    var calcMethod = 'count';
    if( calcMethod == 'count' ){
        calcObj = {
            type: 'number',
            id: 'Count',
            label: 'Count',
            calc: function(dTbl, row){
                var val = dataTbl.getValue(row, ind);
                var counts = dataTbl.getFilteredRows([{
                    column: ind,
                    minValue: null,
                    value: val
                }]);
                var cnt = counts.length;
                return cnt;
            }
        }
    } else if(calcMethod == 'percent' ){
        calcObj = {
            type: 'number',
            id: 'Count',
            label: 'Count',
            calc: function(dTbl, row){
                var rowCnt = dTbl.getNumberOfRows();
                var val = dTbl.getValue(row, ind);
                var counts = dTbl.getFilteredRows([{
                    column: ind,
                    minValue: null,
                    value: val
                }]);
                var cnt = counts.length;
                var pct = cnt/rowCnt;
                return pct;
            }
        }
    }
    
    output.push(calcObj);
    return output;
}
function controlEvent(){
    var ctrl = controls[0];
}
function getMainWrapper(){
    var output = null;
    for( var c = 0; c < chartsArr.length; c++ ){
        var contain = chartsArr[c].getContainer();
        var classes = contain.classList;
        for(var i = 0; i < classes.length; i++ ){
            var classStr = classes[i];
            if( classStr == 'mainTable' ){
                output = chartsArr[c];
            }
        }
    }
    return output;
}
function getFirstIndex(wrap){
    var output = null;
    var wrapName = wrap.getChartName();
    for( var p = 0; p < chartParams.length; p++ ){
        var chrt = chartParams[p];
        var chartId = chrt.chartId;
        if( chartId == wrapName ){
            var dataKeys = chrt.dataKeys;
            var firstKey = dataKeys[0];
            output = dataTbl.getColumnIndex(firstKey);
        }
    }
    return output;
}
function aggregatePie(){
    mainWrap = getMainWrapper();
    mainTable = mainWrap.getDataTable();
    var snap = mainWrap.getSnapshot();
    var tbl = snap.getDataTable();
    var dRows = tbl.getNumberOfRows();
    for(var r = 0; r < dRows; r++){
        var prop = tbl.getRowProperty(r, 'rowIndex');
        if(prop == null){
            tbl.setRowProperty(r, 'rowIndex', r);
        }
    }
    var wrap = chartsArr[1];
    console.log(wrap);
    var wrapView = wrap.getView();
    console.log(wrapView);
    var vwCols = wrapView['columns'];
    var firstInd = 0;
    if( vwCols !== undefined ){
        firstInd = vwCols[0];
    } else {
        firstInd = getFirstIndex(wrap);
    }
    console.log(firstInd);
    var groupArr = [firstInd];
    var method = google.visualization.data.count;
    var colArr = [ {column: 1, aggregation: method, type: 'number'}];
    var colCnt = tbl.getNumberOfColumns();
    var countClone = tbl.clone();
    var g1 = google.visualization.data.group(countClone, groupArr, colArr);
    var vw = new google.visualization.DataView(g1);
    wrap.setDataTable(g1);
    wrap.setOptions(pieOptions);
    wrap.setView(vw);
    wrap.draw();
}
function getTableCols(params){
    var output = [];
    var chartType = params.chartType;
    var visKeys = params.dataKeys;
    var hideKeys = params.hiddenKeys;
    var dataTypes = params.dataTypes;
    for( var v = 0; v < visKeys.length; v++ ){
        var visKey = visKeys[v];
        if( hideKeys.indexOf(visKey) == -1 ){
            var visIndex = dataTbl.getColumnIndex(visKey);
            if( visIndex == -1 ){
                visIndex = dataTbl.getColumnIndex('calc_' + visKey);
            }
            var dataType = dataTypes[v];
            output.push(visIndex);
        }
    }
    return output;
}
function getVisCols(params){
    var output = [];
    var chartType = params.chartType;
    if( chartType == 'PieChart' ){
        output = getPieCols(params);
    } else if ( chartType == 'Table' ){
        output = getTableCols(params);
    }
    return output;
}
function setAggCharts(data){
    for( var c = 0; c < chartParams.length; c++ ){
    var itm = chartParams[c];
    var type = itm.chartType;
    var id = itm.chartId;
    var title = itm.title;
    var dataKeys = itm.dataKeys;
    var dataTypes = itm.dataTypes;
    var opts = getDefaultOptions(type);    
    var visCols = getVisCols(itm);
    
    var wrapper = null;
    if( type == 'PieChart' ){
        //var visRows = getVisRows(itm);
        var visRows = [0, 1];
        wrapper = new google.visualization.ChartWrapper({
            chartType: type,
            containerId: id,
            options: opts,
            dataTable: dataTbl,
            view: {
                columns: visCols,
                //rows: visRows
            }
        });
    } else {
        wrapper = new google.visualization.ChartWrapper({
            chartType: type,
            containerId: id,
            options: opts,
            dataTable: dataTbl,
            view: {
                columns: visCols,
            }
        });
    }
    wrapper.setChartName(id);
    chartsArr.push(wrapper);    
    }
}
function setCharts(data){
    for( var c = 0; c < chartParams.length; c++ ){
    var itm = chartParams[c];
    var type = itm.chartType;
    var id = itm.chartId;
    var title = itm.title;
    var dataKeys = itm.dataKeys;
    var dataTypes = itm.dataTypes;
    var opts = getDefaultOptions(type);    
    var visCols = getVisCols(itm);
    var wrapper = new google.visualization.ChartWrapper({
        chartType: type,
        containerId: id,
        options: opts,
        dataTable: dataTbl,
        view: {
            columns: visCols,
        }
    });
    wrapper.setChartName(id);
    chartsArr.push(wrapper);    
    }
}

function postRenderTableEvents(){
    sizeColumns();
    insertTableTitles();
    attachPopEvents();
}
function sizeColumns(){
    for(var c = 0; c < colArray.length; c++){
        var itm = colArray[c];
        if( itm !== undefined ){
            var colSize = itm.width;
            var colLbl = itm.label;
            var colInd = dataTbl.getColumnIndex(colLbl);
            if( colSize !== undefined && colSize !== null && colInd !== -1 ){
                $('.google-visualization-table-table tr th:nth-child(' + colInd + ')').css('max-width', colSize);
                $('.google-visualization-table-table tr th:nth-child(' + colInd + ')').css('min-width', colSize);
                $('.google-visualization-table-table tr th:nth-child(' + colInd + ') sort-ascending').css('max-width', colSize);
                $('.google-visualization-table-table tr th:nth-child(' + colInd + ') sort-ascending').css('min-width', colSize);
                $('.google-visualization-table-table tr th:nth-child(' + colInd + ') sort-descending').css('max-width', colSize);
                $('.google-visualization-table-table tr th:nth-child(' + colInd + ') sort-descending').css('min-width', colSize);
                $('.google-visualization-table-table tr td:nth-child(' + colInd + ')').css('max-width', colSize);
                $('.google-visualization-table-table tr td:nth-child(' + colInd + ')').css('min-width', colSize);
            }
        }
    }
    
    $(document).off('click', '.google-visualization-table-table thead tr th').on('click', '.google-visualization-table-table thead tr th', function(){
          sizeColumns();
    });
    
}
function onPopExitClick(){
    $('.popOut').hide();
    $('.popOut').remove();
    return;
}
function attachPopEvents(){
    $('.popCell.tableCell').click(function(e){
        var target = e.target;
        var targetClass = target.className;
        if( targetClass.indexOf('popInner') == -1 && targetClass.indexOf('popExitIcon') == -1 && targetClass.indexOf('popOut') == -1 ){
            //Remove previously generated popouts
            $('.popOut').hide();
            $('.popOut').remove();

            //Refer to the cell
            var popCell = $(this);

            //Get this html
            var contents = popCell.html();

            //Get the parent's offsetTop
            var topVal = popCell[0].offsetTop;
            var topStr = topVal + 'px';
            
            //Get the parent's width;
            var widthStr = popCell.css('width');
            var widthVal = parseInt(widthStr.replace('px',''));
            var width = widthVal * 1.5;
                widthStr = width + 'px';

            var popOutStr = '<div class="popOut" style="width: '+widthStr+'; top: '+topStr+'">';
                    popOutStr += '<div class="popInner">';
                        popOutStr += '<a class="popExitLink" href="#" onClick="onPopExitClick();">';
                            popOutStr += '<i class="far fa-times-circle fa-1x popExitIcon"></i>';
                        popOutStr += '</a>';
                        popOutStr += contents;
                    popOutStr += '</div>';
                popOutStr += '</div>';

            popCell.append(popOutStr);

            $('.popOut').show();
        }
    });
}
function setListeners(){
    google.visualization.events.addListener(mainWrap, 'ready', function(){
        aggregatePie(); 
    });
    google.visualization.events.addListener(googleDashboard, 'ready', function(){
        postRenderTableEvents();
    });
}
function drawStuff() {
    console.clear();
    jQuery(document).ready(function($){
        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashboard')
        );
         
        waitForVal('endpoint', function(){
            if(window.endpoint !== null){
                waitForVal('retrievedData', function(){
                    if(window.retrievedData !== null){
                        var dataPromise = new Promise(function(resolve, reject){
                            dataTbl = new google.visualization.DataTable(); //Empty DataTable
                            setDataColumns();
                            Charts.setDataRows(colArray, dataTbl);
                            if( dataTbl.getNumberOfRows() > 0 ){
                                resolve(dataTbl);
                            }
                        });
                        
                        dataPromise.then(function(tbl){
                            Charts.setColumnClasses();
                            return tbl;
                        }).then(function(tbl){
                            //If the first data column is type: number, insert a string representation of it
                            tbl = firstColumnString(tbl);
                            return tbl;
                        }).then(function(tbl){
                            //refactor calc columns - set cells to hold values
                            tbl = resetCalcColumns(tbl);
                            return tbl;
                            
                        }).then(function(tbl){
                            //Set Controls
                            setControls(tbl);
                            setAggCharts(tbl);
                            var output = {
                                controls: controls,
                                wrappers: chartsArr
                            };
                            return output;
                            var ctrl = controls[0];
                        }).then(function(obj){
                            var ctrls = obj.controls;
                            var wraps = obj.wrappers;
                            var otherWraps = [];
                            //Get the main wrapper (every page must have one)
                            for( var w = 0; w < chartParams.length; w++ ){
                                var specs = chartParams[w];
                                var wrap = wraps[w];
                                if( specs.isMain == true ){
                                    mainWrap = wrap;
                                    mainTable = mainWrap.getDataTable();
                                } else {
                                    otherWraps.push(wrap);
                                }
                            }
                            var output = {
                                controls: ctrls,
                                mainWrapper: mainWrap,
                                wrappers: otherWraps
                            };
                            console.log(output);
                            return output;
                        }).then(function(obj){
                            return obj;
                        }).then(function(obj){
                            var ctrls = obj.controls;
                            mainWrap = obj.mainWrapper;
                            mainTable = mainWrap.getDataTable();
                            
                            var wraps = obj.wrappers;
                            //For each filter, bind the filter
                            for( var c = 0; c < ctrls.length; c++ ){
                                var ctrl = ctrls[c];
                                dashboard.bind(
                                    ctrl,
                                    mainWrap
                                );
                                
                            }
                            googleDashboard = dashboard;
                            googleDashboard.draw(dataTbl);
                            return obj;
                        }).then(function(obj){
                            setListeners();
                            return obj;
                        });
                        
                    }
                });
                setListData();
            }
        });
        setControlsDiv();
        setControlsArray();
        setChartElems();
        setChartParams();
        setColArray();
        setRowKeys();
        setEndpoint();
    });
}
