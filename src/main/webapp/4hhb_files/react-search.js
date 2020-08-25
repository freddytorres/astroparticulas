/* script that allows search react components to talk to jquery */

var template = 'search.pug'

var reactDispatchAction // this will be initialized in the react app to point to the search.dispatchAction function

var dt = new Date()
var month = dt.getMonth() + 1
if (month < 10) month = '0' + month
var day = dt.getDate()
if (day < 10) day = '0' + day
//var datePickerEndDate = month + '/' + day + '/' + dt.getFullYear()
var datePickerOptions = { autoclose: true, startView: 2, startDate: "05/19/1976" } // , endDate: datePickerEndDate

// TODO deprecate - this can now be handled within the react component
//- post ids to downloads page
function downloadIds(ids) {
    $('input[name="ids"]').val(ids)
    $('#download-ids-form').submit()
}

// call react function to set tab
function help() {
    reactDispatchAction('SET_VIEW', { tab: 'TAB_HELP' })
}

// set tooltips for react components that are created programmatically
function setDatePicker(id, type) {
    console.log('react-jquery.setDatePicker: ', id, type)
    if ($('#' + id).length) {
        var selector = (type === 'range') ? '#' + id + ' .input-daterange' : '#' + id + ' .input-group.date'
        $(selector).datepicker(datePickerOptions)
    }
}

// remove datepicker obj when it is unmounted
function removeDatePicker(id) {
    console.log('react-jquery.removeDatePicker: ', id)
    if ($('#' + id).length) $('#' + id).datepicker('remove')
}

function setDispatchAction(func) {
    reactDispatchAction = func
}

// for dev view objects
function toggleAll(id) {
    //console.log('toggleAll', id)
    var o = $('#tbody' + id)
    if (o.is(':visible')) {
        o.hide()
        o.find('tbody').hide()
    } else {
        o.show()
        o.find('tbody').show()
    }
}

// for dev view objects
function toggleStateObj(id) {
    //console.log('toggleStateObj', id)
    var o = $('#tbody' + id)
    if (o.is(':visible')) o.hide()
    else o.show()
}

/*
Note: during development the non-minimized version of the bootstrap-datepicker.js library is used, because some modifications were made to that file
<td className='calendar-input'>
    <div id={this.calendarId}>
        <div className="input-group date"> // el
            <input
                type="text"
                value={value}
                id={guid}
                name={rule.id}
                className="form-control"
                placeholder={placeholder}
                autoComplete='off' />
            <span className="input-group-addon">{s.calendarIcon}</span>

            // range
            <div id={this.calendarId}>
                <div className="input-daterange input-group" id="datepicker"> // el
                    <input type="text" className="input-sm form-control" name="start" />
                    <span className="input-group-addon">to</span>
                    <input type="text" className="input-sm form-control" name="end" />
                </div>
            </div>

*/
function updateSearch(element, value) {
    console.log('updateSearch: ' + value)
    /*for(var p in element) {
        if (typeof element[p] !== 'function') {
            console.log(p + ' = ' + element[p])
        }
    }
    console.log('----------')*/

    var el = element[0]
    /*for(var p in el) {
        if (typeof el[p] !== 'function') {
            console.log(p + ' = ' + el[p])
        }
    }*/

    console.log('el.nodeName=' + el.nodeName)
    //console.log('el.className=' + el.className)
    //console.log('el.id=' + el.id)

    var inputId, ruleId
    if (el.nodeName === 'INPUT') { // DIV|INPUT
        console.log('range')
        inputId = (el.name === 'start') ? 'from' : 'to'
        ruleId = el.id.replace(el.name, '')
    } else {
        //console.log('el.children.length=' + el.children.length)
        //console.log('el.children[0].id=' + el.children[0].id)
        //console.log('el.children[0].name=' + el.children[0].name)

        if (el.children[0]) {
            var input = el.children[0]
            inputId = input.id
            ruleId = input.name
        }
    }
    console.log('updateSearch:', inputId, ruleId, value)
    reactDispatchAction('QB_TEXT_SET_VALUE', { ruleId, inputId, value })
}

// track in google analytics
function sendGtag(event_category, event_action, event_label) {
    if (typeof gtag !== 'undefined') { // for classic
        gtag('event', event_action, { event_category, event_label })
    }
}

$(window).on('load', loadSearch) // TODO replace with document.addEventListener("DOMContentLoaded", function () {})
var loadSearchCount = 0

function loadSearch() {
    if (window.React) {
        console.log('loadSearch: RC.isProductionServer=' + RC.isProductionServer)
        var search = document.createElement('script')
        var ts = (RC.isProductionServer) ? Math.floor(Date.now() / 600000) : Date.now()
        search.src = (RC.isProductionServer) ? '/build/js/search.min.js?ts=' + ts : '/build/js/search.js?ts=' + ts
        
        document.body.appendChild(search)
        search.onload = search.onreadystatechange = function() {
            console.log('search loaded')
        }
    } else {
        if (++loadSearchCount < 10) setTimeout(loadSearch, 250)
        else alert('ERROR: UNABLE TO LOAD SEARCH COMPONENT AFTER ' + loadSearchCount + ' ATTEMPTS')
    }
}