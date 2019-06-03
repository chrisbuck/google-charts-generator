var shortDate = null;

(function(window){
    
    var Charts = (function(){
        function Charts(){
            return this;
        }
        
        Charts.prototype = {
            //Defaults (pulls from global objects, also available to this namespace)
            defaultColumns: function(colArr){
                if( colArr == undefined ){
                    return colArray;
                } else {
                    return colArr;
                }
            },
            defaultControls: function(ctrlArr){
                if( ctrlArr == undefined ){
                    return controlParams;
                } else {
                    return ctrlArr;
                }
            },
            defaultControlNames: function(ctrlArr){
                if( ctrlArr == undefined ){
                    return controlNames;
                } else {
                    return ctrlArr;
                }
            },
            defaultFilterViews: function(fViews){
                if( fViews == undefined ){
                    return filterViews;
                } else {
                    return fViews;
                }
            },
            defaultRows: function(rows){
                if( rows == undefined ){
                    return rowKeys;
                } else {
                    return rows;
                }
            },
            defaultTable: function(dTbl){
                if( dTbl == undefined ){
                    return dataTbl;
                } else {
                    return dTbl;
                }
            },
            defaultView: function(dView){
                if( dView == undefined ){
                    return displayView;
                } else {
                    return dView;
                }
            },
            defaultVisualType: function(type){
                if( type == undefined ){
                    return chartType;
                } else {
                    return type;
                }
            },
            //Gets
            getCalculatedColumns: function(lbl, dView){
                var vw = this.defaultView(dView);
                var output = [];
                var c = 0;
                var colCnt = vw.getNumberOfColumns();
                for( c = 0; c < colCnt; c++ ){
                    var colId = vw.getColumnId(c);
                    var colLbl = vw.getColumnLabel(c);
                    if( colId.indexOf('calc_') > -1 && lbl == colLbl ){
                        output.push(c);
                    }
                }
                return output;
            },
            getControl: function(ctrl, dView, wrap){
                var type = ctrl.type;
                var lbl = ctrl.label;
                var filterIndex = dView.getColumnIndex(lbl);
                if(filterIndex == -1 ){
                    return null;
                }
                var opts = ctrl.options;
                var ctrlElem = $('.dashControls [data-label="' + lbl + '"]');
                var ctrlDiv = this.getControlDiv(type, lbl, ctrlElem);
                var ctrlId = ctrlDiv[0].id;
                var ctrl = null;
                var filterStr = null;
                if( type.toLowerCase() == 'string' || type.toLowerCase() == 'category' ){
                    filterStr = properCase(type) + 'Filter';
                } else {
                    filterStr = properCase(type) + 'RangeFilter';
                }
                var controlOptions = {};

                controlOptions.filterColumnIndex = filterIndex;
                
                var filterLbl = dView.getColumnId(filterIndex);
                var uiOpts = {
                    label: filterLbl,
                    labelSeparator: ':'
                };
                controlOptions.ui = uiOpts;
                
                if( type == 'String' ){
                    controlOptions.matchType = 'any';
                }
                
                var overrides = opts;
                if( overrides !== undefined ){
                    controlOptions = overrides;
                    controlOptions.filterColumnIndex = filterIndex;
                }
                
                ctrl = new google.visualization.ControlWrapper({
                    controlType: filterStr,
                    containerId: ctrlId,
                    options: controlOptions,
                });
                
                ctrl.setControlName(lbl);
                //controls.push(ctrl);
                //controlNames.push(lbl);
                //googleDashboard.bind(ctrl, wrapper);
                return ctrl;
            },
            getControlDiv: function(type, lbl, ctrl){
                var ctrlCnt = ctrl.length;
                if( ctrlCnt < 2 ){
                    var typeStr = type.toLowerCase() + 'Control';
                    var ctrlStr = '';
                    var ctrlId = 'control-' + lbl;
                    ctrlStr += '<div id="'+ctrlId+'" class="chartControl '+typeStr+' headerControl"></div>';
                    if( typeStr == 'stringControl' ){
                        ctrlStr = prependSearchLabel(ctrlStr);
                    }
                    ctrl.remove();
                    dashboardDiv.append(ctrlStr);
                    ctrl = $('#' + ctrlId);
                }
                return ctrl;
            },
            getDataRows: function(dTbl){
                var data = this.defaultTable(dTbl);
                var rowCnt = data.getNumberOfRows();
                var r = 0;
                var dataRows = [];
                for( r = 0; r < rowCnt; r++ ){
                    dataRows.push(r);
                }
                return dataRows;
            },
            getDisplayTable: function(dTbl){
                var data = this.defaultTable(dTbl);
                var displayTbl = data.clone();
                return displayTbl;
            },
            getViewVals: function(colLbl, dView){
                var data = this.defaultView(dView);
                var ind = data.getColumnIndex(colLbl);
                var rows = view.getFilteredRows([{
                    column: ind,
                }]);
                var vals = [];
                var r = 0;
                for( r in rows ){
                    var row = rows[r];
                    var val = data.getValue(row, ind);
                    vals.push(val);
                }
                return vals;
            },
            getOptions: function(opts){
                if( opts == undefined ){
                    return defaultOptions;
                } else {
                    if( chartOptions[0] == undefined ){
                        chartOptions = opts;
                        return opts;
                    } else {
                        return chartOptions;
                    }
                }
            },
            getRecordCountDiv: function(){
                var div = $('#recordCountDiv');
                var testDiv = div[0];
                if( testDiv == undefined ){
                    return null;
                } else {
                    return div;
                }
            },
            getRowCount: function(){
                var renderedTbl = chartWrap.getDataTable();
                var cnt = renderedTbl.getNumberOfRows();
                rowCount = cnt;
                return cnt;
            },
            getTable: function(dTbl){
                var tbl = this.defaultTable(dTbl);
                return tbl;
            },
            getView: function(dView){
                var vw = this.defaultView(dView);
                return vw;
            },
            getVisualType: function(type){
                var visType = this.defaultVisualType(type);
                if( visType == 'Table' ){
                    return 'Table';
                } else {
                    if( visType !== 'Histogram' ){
                        return visType + 'Chart';
                    } else {
                        return visType;
                    }
                } 
            },
            //Create
            createDashboard: function(dashId){
                var dashDivId = null;
                if(dashId == undefined){
                  dashDivId = dashboardDiv[0].id;
                } else {
                  dashDivId = dashId;
                }
                googleDashboard = new google.visualization.Dashboard(document.getElementById(dashDivId));
            },
            createDataTable: function(){
                dataTbl = new google.visualization.DataTable();
                this.setDataColumns();
                this.setDataRows();
                return dataTbl;
            },
            createView: function(dTbl){
                var data = this.defaultTable(dTbl);
                var output = new google.visualization.DataView(data);
                return output;
            },
            createWrapper: function(visualType, data, targetDiv, cols){
                var divId = null;
                if( targetDiv == undefined) {
                    divId = chartDiv;
                } else {
                    divId = targetDiv;
                }
                var output = new google.visualization.ChartWrapper({
                    chartType: visualType,
                    containerId: divId,
                    //dataTable: data,
                    view: {
                        columns: cols
                    }
                });
                //chartWrap = output;   //No longer setting to global, in order to create multiple charts.
                return output;
            },
            //Adds
            addCalcColumn: function( label, colArr, callback, origAction, dView, wrapper ){
                var vw = this.defaultView(dView);
                var colObj = {
                    type: 'string',
                    label: label,
                    id: 'calc_' + label,
                    calc: callback
                };

                var existingIndexes = this.getCalculatedColumns(label, vw);
                if( existingIndexes.length == 0 ){
                    viewCols.push(colObj);
                    vw.setColumns(viewCols);
                    wrapper.setView(vw);

                    if( origAction !== undefined ){
                        if( origAction == 'replace' ){
                            var v = 0;
                            vw = wrapper.getView();
                            var vCnt = vw.getNumberOfColumns();
                            for( v in colArr ){
                                var lbl = colArr[v];
                                var ind = vw.getColumnIndex(lbl);
                                hiddenCols.push(ind);
                                hiddenCols = Arrays.uniques(hiddenCols);
                            }
                        }
                    }
                }
            },
            //Sets
            setColumnClasses: function(dTbl){
                var data = this.defaultTable(dTbl);
                var cols = this.defaultColumns();
                var c = 0;
                for( c in cols ){
                    var classes = cols[c]['classes'];
                    if( classes !== null ){
                        var classStr = '';
                        for( var i = 0; i < classes.length; i++ ){
                            classStr += classes[i];
                            if( i < classes.length - 1 ){
                                classStr += ' ';
                            }
                        }
                        data.setColumnProperty(parseInt(c), 'className', classStr);
                    }
                }
            },
            setControls: function(ctrlArr, dView, wrapper){
                var ctrls = this.defaultControls(ctrlArr);
                var c = null;
                for( c in ctrls ){
                    this.setControl(ctrls[c], dView, wrapper);
                }
            },
            setControl: function(ctrl, dView, wrapper){
                var type = ctrl.type;
                console.log(type);
                var lbl = ctrl.label;
                console.log(lbl);
                var filterIndex = dView.getColumnIndex(lbl);
                var opts = ctrl.options;
                var ctrlDiv = this.setControlDiv(type, lbl);
                var ctrlId = ctrlDiv[0].id;
                var ctrl = null;
                var filterStr = null;
                if( type.toLowerCase() == 'string' || type.toLowerCase() == 'category' ){
                    filterStr = properCase(type) + 'Filter';
                } else {
                    filterStr = properCase(type) + 'RangeFilter';
                }
                var controlOptions = {};

                controlOptions.filterColumnIndex = filterIndex;
                
                var filterLbl = dView.getColumnId(filterIndex);
                var uiOpts = {
                    label: filterLbl,
                    labelSeparator: ':'
                };
                controlOptions.ui = uiOpts;
                
                if( type == 'String' ){
                    controlOptions.matchType = 'any';
                }
                
                var overrides = opts;
                if( overrides !== undefined ){
                    controlOptions = overrides;
                    controlOptions.filterColumnIndex = filterIndex;
                }
                
                ctrl = new google.visualization.ControlWrapper({
                    controlType: filterStr,
                    containerId: ctrlId,
                    options: controlOptions,
                });
                
                ctrl.setControlName(lbl);
                //controls.push(ctrl);
                //controlNames.push(lbl);
                //googleDashboard.bind(ctrl, wrapper);
            },
            setControlDiv: function(type, lbl){
                var ctrl = $('#' + dashId + ' .dashControls [data-label="'+lbl+'"]');
                console.log(ctrl);
                var ctrlCnt = ctrl.length;
                if( ctrlCnt < 2 ){
                    var typeStr = type.toLowerCase() + 'Control';
                    console.log(typeStr);
                    var ctrlStr = '';
                    var ctrlId = 'control-' + lbl;
                    ctrl[0].id = ctrlId;
                    ctrlStr += '<div id="'+ctrlId+'" class="chartControl '+typeStr+' headerControl"></div>';
                    if( typeStr == 'stringControl' ){
                        ctrlStr = prependSearchLabel(ctrlStr);
                    }
                    ctrl.remove();
                    dashboardDiv.append(ctrlStr);
                    ctrl = $('#' + ctrlId);
                }
                return ctrl;
            },
            setDataColumns: function(cols, dTbl){
                var colArr = this.defaultColumns(cols);
                var data = this.defaultTable(dTbl);
                var c = null;
                for(c in colArr){
                    var itm = colArr[c];
                    //Add column by index, for all except "calc" types
                    if(itm.type !== 'calc' ){
                      this.setDataColumn(itm, data);
                    }
                }
                return data;
            },
            setDataColumn: function(params, dTbl){
                var data = dTbl;
                var type = params.type;
                var label = params.label;
                var id = params.id;
                //var role = params[3];
                //var pObj = params[4];
                var addObj = {};
                if(type !== undefined && type !== null){
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
            },
            setDataRows: function(rows, dTbl){
                var data = this.defaultTable(dTbl);
                var rws = this.defaultRows(rows);
                var cols = this.defaultColumns();
                if(this.boolHasDateColumn() == false ){
                    var dataArr = [];
                    for( var d = 0; d < listData.length; d++ ){
                        var dataRow = listData[d];
                        var pushArr = [];
                        var k = 0;
                        //push each value to the row (pushArr)
                        for(k in rws){
                            var colType = cols[k].type;
                            if( colType !== 'calc' ){
                              pushArr.push(dataRow[rws[k]]);
                            }
                        }
                        //push the entire row to rows
                        dataArr.push(pushArr);
                    }
                    data.addRows(dataArr);
                } else {
                    data = this.setEmptyRows(data);
                    data = this.setPopulatedRows(data);
                    data = this.setDateColumns(data);
                }
                return data;
            },
            setDateColumns: function(data){
                var cols = this.defaultColumns();
                var c = null;
                for( c in cols ){
                    if(cols[c]['type'] == 'date' || cols[c]['type'] == 'datetime' ){
                        shortDate.format(data, parseInt(c));
                    }
                }
                return data;
            },
            setEmptyRows: function(dTbl){
                for( var d = 0; d < listData.length; d++ ){
                    dTbl.addRow();
                }
                return dTbl;
            },
            setFilterViews: function(fViews, ctrlArr, names){
                if( fViews !== null ){
                    var fltrViews = this.defaultFilterViews(fViews);
                    var ctrls = controls;
                    var ctrlNames = this.defaultControlNames(names);
                    var f = 0;
                    for( f in fltrViews ){
                        var filter = fltrViews[f];
                        var label = filter.label;
                        var ctrlIndex = ctrlNames.indexOf(label);
                        var ctrl = ctrls[ctrlIndex];
                        if( filter.type == 'Category' ){
                            ctrl.setState({
                                selectedValues: filter.values
                            });
                            ctrl.draw();
                        } else if( filter.type == 'String' ){
                            ctrl.setState({
                                value: filter.value
                            });
                            ctrl.draw();
                        }
                    }
                }
            },
            setFilterViewsEmpty: function(ctrlArr){
                var ctrls = controls;
                var f = 0;
                for(f in ctrls){
                    var ctrl = ctrls[f];
                    var ctrlType = ctrl.getControlType();
                    if( ctrlType == 'CategoryFilter' ){
                        ctrl.setState({
                           selectedValues: []
                        });
                        ctrl.draw();
                    }
                }
            },
            setPopulatedRows: function(data){
                var cols = this.defaultColumns();
                var keys = this.defaultRows();
                for( var r = 0; r < listData.length; r++ ){
                    var dataRow = listData[r];
                    for( var k = 0; k < keys.length; k++ ){
                        var key = String(keys[k]);
                        var colItm = cols[k];
                        var colInd = dataTbl.getColumnIndex(properCase(key));
                        if(colInd == -1 ){
                            var altLbl = colItm.id;
                            colInd = dataTbl.getColumnIndex(altLbl);
                        }
                        var colType = dataTbl.getColumnType(colInd);
                        if( colType !== 'calc' ){
                          var val = dataRow[key];
                          var cellVal = null;
                          if ( colType == 'date' && key !== undefined ){
                              
                              val = getValidDate(val);
                              cellVal = new Date(this.formatShortDate(val));
                          } else {
                              if( this.boolIsSubItem(key) == true ){
                                  var mainKey = key.substr(0, key.indexOf('['));
                                  var subKey = key.replace(mainKey, '');
                                      subKey = subKey.replace('[', '');
                                      subKey = subKey.replace(']', '');
                                  if(dataRow[mainKey] !== null ){
                                      val = dataRow[mainKey][subKey];
                                  } else {
                                      val = null;
                                  }
                              }
                              cellVal = val;
                          }
                          data.setCell(r, k, cellVal);
                        }
                    }
                }
                return data;
            },
            setPrimaryColumn: function(primeCol){
                var primeInd = dataTbl.getColumnIndex(primeCol);
                var rewrapped = Arrays.moveFirst(primeInd, wrapCols);
                return rewrapped;
            },
            setWrapCols: function(dTbl){
                var data = this.defaultTable(dTbl);
                wrapCols = [];
                var colCnt = data.getNumberOfColumns();
                var c = 0;
                for(c = 0; c < colCnt; c++){
                    if(hiddenCols.indexOf(c) == -1 ){
                    wrapCols.push(c);
                    }
                }
            },
            //Display
            hideColumns: function(dView){
                var vw = this.defaultView(dView);
                for( var h = 0; h < hiddenCols.length; h++ ){
                    var hiddenLbl = hiddenCols[h];
                    var hiddenInd = vw.getColumnIndex(hiddenLbl);
                    viewCols.splice(hiddenInd, 1);
                }
                displayView.setColumns(viewCols);
            },
            showRecordCount: function(){
                var recordDiv = this.getRecordCountDiv();
                if( recordDiv !== null ){
                    var cnt = this.getRowCount();
                    recordDiv.empty().append(cnt);
                }
            },
            //Booleans
            boolColHasClass: function(cols, c){
                var output = false
                var props = cols[c][3];
                if( props !== undefined ){
                    var classes = props.classes;
                    if( classes !== undefined ){
                        output = true;
                    }
                }
                return output;
            },
            boolColumnStyled: function(k, cols){
                var output = false;
                var style = cols[k][3];
                if( style !== undefined ){
                    output = true;
                }
                return true;
            },
            boolHasDateColumn: function(){
                var output = false;
                var cols = this.defaultColumns();
                var c = null;
                for( c in cols ){
                    if( cols[c]['type'] == 'date' || cols[c]['type'] == 'datetime' ){
                        output = true;
                    }
                }
                return output;
            },
            boolIsSubItem: function(key){
                var output = false;
                if( key.indexOf('[') > -1 && key.indexOf(']') > -1 ){
                    output = true;
                }
                return output;
            },
            //Formatters
            formatShortDate: function(str){
                var output = null;
                if(shortDate == null) {
                    shortDate = new google.visualization.DateFormat(
                        //{formatType: 'short'} Cannot specify both format type and pattern
                        {pattern: "M'/'d'/'YYYY"}
                    );
                }
                if( str !== null ){
                  var dateObj = getValidDate(str);
                  output = shortDate.formatValue(dateObj);
                }
                return output;
            }
        };
        return Charts;
    }());
    
    Charts.create = function(){
        return new Charts();
    };
    
    window.Charts = Charts;
    
}(window));
