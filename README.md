# Google Charts Generator

----
## Overview

The Google Charts Generator is a suite of javascript files and stylesheets allowing a user to draw Google Charts using only HTML.

> Example 1:  

    <div id="tableChart" class="gChart mainTable chartVisible" data-charttype="table">
    <a class="endpoint" href="sample-data.js"></a>
      <div class="dataColumns">
        <div id="Index" data-type="number" data-label="Index" data-key="index" width="45px"></div>
        <div id="Name" data-type="string" data-label="Name" data-key="name" width="110px"></div>
        <div id="Company" data-type="string" data-label="Company" data-key="company" width="110px"></div>
        <div id="Email" data-type="string" data-label="Email" data-key="email" width="220px"></div>
        <div id="DateRegistered" data-type="date" data-label="Date Registered" data-key="registered" width="110px"></div>
        <div id="Person Link" data-type="calc" data-calcdispose="preserve" data-calctype="string" data-label="Person Link" width="110px">
            <a class="calcLink" href="{Index}">{Name}</a>
        </div>
      </div>
    </div>
...Will display a Table Chart.

The columns and rows are set using data tags (e.g., "data-label") and custom attributes (e.g., "visibility"). No custom javascript coding is necessary, meaning non-developers can implement Google Charts simply by editing familiar html, and referring to these instructions.

The Generator (or "application") should fit the majority of basic use cases, but the code can be edited directly and extended. If, for instance, you need certain jQuery events to be triggered by the Google Charts API, you will need to write your own custom functions and callbacks and hook into the chartGenerator.js file.

----
## Dependencies
The application primarily depends on the Google Charts API, and so that will need to be loaded in the header (or above the html used to draw the chart).

There are also several other libraries that are referenced in the chartConstructor and chartGenerator files, and so also need to be referenced in the header (or first body section). You can download several of these libraries straight from source, or use a CDN, but specific version are provided here as well.

Some of the files need to be referenced in a particular order, and others don't, so for simplicity, reference the files in your header in this order:

1. FontAwesome (CSS)
2. Bootstrap (CSS)
3. ChartGenerator (CSS)
4. jQuery (JS)
5. Google API Loader (JS)

And in the footer (or below the html defining how to draw the charts), reference, in order, the following:

1. ChartConstructor (JS)
2. Chart Generator (JS)

## Constructing the Main Table
*See Example 1, above*

### Steps:
1. Create a div element with an arbitrary id.
2. Assign the div the following classes: "gChart mainTable chartVisible".
3. Assign the div a data tag to specify the chart type (currently either "table" or "pie"). For example, a the main table is constructed with "data-charttype="table".
4. Include a div inside the mainTable with class of "dataColumns."
5. For each column you want in your table, add a div with the following attributes:
    * id,
    * data-type: (number, string, or calc),
    * data-label,
    * data-key,
    * width

## Creating Data Columns
*See Example 1, above*

All data columns, regardless of chart type, need to be placed in a div (class: "dataColumns" within the parent div (class: "gChart"). The subordinate divs (subordinate to ".dataColumns") do not need any classes of their own.

Within each column div, specify the following parameters:
  
* id: This is an arbitrary string used to distinguish one data column from another.
* data-type: number, string, or calc.
* data-label: The label that appears in the header for the column. 
* data-key: This is the key used to retrieve the data. It has to match the JSON data exactly, and you need to know it in advance.
  * Example: In sample-data.js, the identifier (or key) for the employee's name is "name". Note the lower case (case matters).
* width: Specify the width of the table column in pixels. Note: width will not affect the display for other chart types (like pie, bar, etc.), so it only needs to be included in table charts.
* visibility: If visibility="hidden", you hide the entire column.

## Creating Calculated Columns

> Example 2:

    <div id="Person Link" data-type="calc" data-calcdispose="preserve" data-calctype="string" data-label="Person Link" width="110px">
        <a class="calcLink" href="{Index}">{Name}</a>
    </div>

Whether you are using calculated columns in a table visualization, a pie visualization, or any other type, the approach is the same:

1. Create a data column div with some additional parameters:
  * data-calcdispose: Available values (preserve or replace) specify whether to keep the source columns in the data table or not. You can always hide the source columns, so there's really not much reason to select replace, but you might need to. Default: "preserve".
  * data-calctype: Specifies whether the calculated column function will be performing mathematics (e.g., data-calctype="number") or text replacements (e.g., data-calctype="string").
2. If you are creating a column that inserts texts from the values in other columns, simply use enclosing brackets ("{" and "}") to specify the source columns. The text within the brackets must match the id (not the label) of another data column.
