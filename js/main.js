    var rawdata; 
    var objdata = [];
    var matchDateEvents;
    var matchedEvents;
    var datefilter = {
        eventdate: null
    }

    var QueryString = function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        } 
        return query_string;
    } ();

    var getData = function(month, year) {
        // console.log(objdata);
        var ajaxUrl = 'https://smgapps.bu.edu/calendar/getmonth.cfm';
        if (month && year) {
            ajaxUrl += '?month=' + month + '&year=' + year;
        };
        $.ajax({
            url: ajaxUrl,
            type: 'get',
            dataType: 'json'
        }).done(function (data) {
            rawdata = data;
            convertData(rawdata)
        });
    };

    var convertData = function (data) {
        // setting objdata
        for (var i = 0 ; i < data.DATA.length ; i++) {
            objdata[i] = {};
            objdata[i]['id'] = data.DATA[i][0];
            objdata[i]['title'] = data.DATA[i][1];
            objdata[i]['message'] = data.DATA[i][2];
            objdata[i]['isPending'] = data.DATA[i][3];
            objdata[i]['approved'] = data.DATA[i][4];
            objdata[i]['sector'] = data.DATA[i][5];
            objdata[i]['eventdate'] = moment(data.DATA[i][6]).format('YYYY-MM-DD');
            objdata[i]['untildate'] = data.DATA[i][7];
            objdata[i]['recurrance'] = data.DATA[i][8];
            objdata[i]['recurrenceDay'] = data.DATA[i][9];
            objdata[i]['isAllDayEvent'] = data.DATA[i][10];
            objdata[i]['start_time'] = moment(data.DATA[i][11]).format('h:mma');
            objdata[i]['end_time'] = moment(data.DATA[i][12]).format('h:mma');
            objdata[i]['location'] = data.DATA[i][13];
            objdata[i]['weblink'] = data.DATA[i][14];
            objdata[i]['contactName'] = data.DATA[i][15];
            objdata[i]['contactEmail'] = data.DATA[i][16];
            objdata[i]['sponsors'] = data.DATA[i][17];
            objdata[i]['category'] = String(data.DATA[i][18]).split(",");
            objdata[i]['ad'] = data.DATA[i][19];
            objdata[i]['calText'] = "";
            // define overall category as string
            var deptCat = [];
            if (_.indexOf(objdata[i]['category'],'30') !== -1) {
                deptCat.push('undergrad');
            };
            if (_.indexOf(objdata[i]['category'],'18') !== -1) {
                deptCat.push('graduate');
            };
            if (_.indexOf(objdata[i]['category'],'11') !== -1) {
                deptCat.push('executive');
            };
            if (_.indexOf(objdata[i]['category'],'42') !== -1) {
                deptCat.push('alumni');
            };
            if (_.indexOf(objdata[i]['category'],'516') !== -1) {
                deptCat.push('faculty');
            };
            if (_.indexOf(objdata[i]['category'],'517') !== -1) {
                deptCat.push('staff');
            };
            if (_.indexOf(objdata[i]['category'],'518') !== -1) {
                deptCat.push('other');
            };
            if (deptCat.length >4) {
                objdata[i]['calText'] = 'All'
            } else { objdata[i]['calText'] = deptCat.join(" | ")};
        };
        console.log(objdata);
        // display dates with events 
        var eventDateArr = _.uniq(_.pluck(objdata,'eventdate'));
        for (var i = eventDateArr.length - 1; i >= 0; i--) {
            var tmp = '.calendar-day-' + eventDateArr[i];
            $(tmp).addClass('event');
        }; 

        // If Date Specified
        if (QueryString.date) {
            datefilter.eventdate = QueryString.date;
            renderEventList();
        } else {
            $('.today').trigger('click');
        };

    };

    var renderEventList = function () {
        // hide currentevent 
        $('#eventContainer').hide();
        $('#eventAd').html('');
        $('#eventTemp').fadeIn();

        // get category filters
        var catfilter = $('input.sub-event:checkbox:checked').map(
            function () {
              return $(this).val()
            }
          ).get();
        // get events with category from objdata
        if (catfilter.length === 0 ) {
          // catfilter = [""];
          matchedCatEvents = objdata;
        } else {
          matchedCatEvents = _.filter(objdata, function (evnt) {
            // console.log(evnt.category);
            // var arr = evnt.category;
            return _.intersection(evnt.category, catfilter).length > 0; 
          });
        };


        // first match date 
        matchedEvents = _.filter(matchedCatEvents, function (evnt) {
          return (moment(evnt.eventdate).isSame(datefilter.eventdate) || moment(evnt.eventdate).isAfter(datefilter.eventdate));   
        });

        matchedEvents = _.sortBy(matchedEvents, function (evnt) {
          return evnt.eventdate;
        });

        console.log(matchedEvents);

        // compile html
        var startingdate = datefilter.eventdate;
        var html = '<h5>'+moment(startingdate).format("ddd, MMM Do")+'</h5>';
        
        var listLen = 15;
        if (matchedEvents.length < 15) { listLen = matchedEvents.length; } 

        for (var i = 0; i < listLen; i++) {
            if (matchedEvents[i].eventdate !== startingdate) {
              html += '<h5>'+moment(matchedEvents[i].eventdate).format("ddd, MMM Do")+'</h5>';
              startingdate = matchedEvents[i].eventdate;
            };
            html += '<li class="eventitem" data-id="' + matchedEvents[i].id + '" data-date="' + matchedEvents[i].eventdate +'">';
            html += '<span class="evntTitle">' + matchedEvents[i].title + '</span>';
            html += '<span class="evntCaltext text-muted">' + matchedEvents[i].calText + '</span>';
            html += '<span class="badge">'+ parseTime(matchedEvents[i]['start_time']) + '</span>';
            html += '</li>';
        };
        // show events
        $('#eventlist').hide().html(html).fadeIn();
        addEventHandlers();
    }

    // function to add item addEventHandlers
    function addEventHandlers () {
        $('.eventitem').click(function (e) {
            $('.eventitem .badge').removeClass('select-badge');
            $(this).find('.badge').addClass('select-badge');
            var zid = $(this).attr('data-id');
            var zdate = $(this).attr('data-date');
            
            // console.log(zyear); console.log(zmonth); console.log(zday);
            window.history.pushState("","", window.location.pathname + '?date=' + zdate + '&id=' + zid);
            displayEvent(zid, zdate);
            $('html, body').animate({
                    scrollTop: $("#eventContainer").offset().top - 120
                }, 500);  
        });

        // If id specified, trigger the click
        if (QueryString.date && QueryString.id) {
            var tmp = '.eventitem[data-id="' + QueryString.id + '"][data-date="' + QueryString.date + '"]';
            $(tmp).trigger('click');
            // QueryString.id = false;
        };
    }

    function displayEvent (zid, zdate) {

        zid = parseInt(zid);
        var selectedEvent = _.findWhere(matchedEvents, {id: zid, eventdate: zdate});

        // hide default 
        $('#eventTemp').hide();

        //set the event title
        $('h1.eventTitle').html(selectedEvent.title);

        //set the event description
        $('p.eventDescription').html(selectedEvent.message);

        //set the event time
        var ttime = parseTime(selectedEvent['start_time']);
        if (ttime == 'All day') {
            $('td#eventWhen').html(ttime + ' on ' + moment(selectedEvent.eventdate).format('MMM Do, YYYY')); 
        } else {
            $('td#eventWhen').html(ttime + ' to ' + parseTime(selectedEvent['end_time']) + ' on ' + moment(selectedEvent.eventdate).format('MMM Do, YYYY')); 
        }

        //set the event location
        $('#eventLocation').html(selectedEvent.location);

        //set the event weblink
        var hasLink = (selectedEvent.weblink !== "http://" && selectedEvent.weblink);
        if (hasLink) {
            $('#eventLink').attr('href', selectedEvent.weblink).show();
        } else {
            $('#eventLink').hide();
        }

        //set the event sponsor
        $('#eventSponsor').html(selectedEvent.sponsors);
        
        //show event contact name and email
        $('#eventContact').attr('href', 'mailto:' + selectedEvent.contactEmail).html(selectedEvent.contactName)
        
        //display gcal and ics links
        var gcaldate = moment(selectedEvent['eventdate']).format('YYYYMMDD');
        var gcalstarttime = moment(selectedEvent['start_time'],'h:mma').utc().format('HHmmss')+'Z';
        var gcalendtime = moment(selectedEvent['end_time'],'h:mma').utc().format('HHmmss')+'Z';
        var gcalstartdatetime = gcaldate+'T'+gcalstarttime;
        var gcalenddatetime = gcaldate+'T'+gcalendtime;
        // console.log(gcaldate);console.log(gcalstarttime);console.log(gcalendtime);console.log(gcalstartdatetime);console.log(gcalenddatetime);
        var gcalhref = 'http://www.google.com/calendar/event?action=TEMPLATE';
        if (ttime === "All day") {
            gcalhref += "&dates=" + gcaldate + "/" + gcaldate;
        } else {
            gcalhref += "&dates=" + gcalstartdatetime + "/" + gcalenddatetime;
        };
        gcalhref += "&text=" + encodeURIComponent(selectedEvent.title) +
        "&details=" + encodeURIComponent(selectedEvent.message) + 
        (selectedEvent.location && "&location=" + encodeURIComponent(selectedEvent.location));
        // set gcal href
        $('#addgcal').attr('href',gcalhref);

        var icsdateStart="", icsdateEnd="";
        // Reformat dates for ICS
        if(ttime === "All day") {
            icsdateStart = "DTSTART;VALUE=DATE:" + gcaldate;
            icsdateEnd = "DTEND;VALUE=DATE:" + gcaldate;
        } else {
            icsdateStart = "DTSTART:" + gcalstartdatetime;
            icsdateEnd = "DTEND:" + gcalenddatetime;
        }

        // Generate the ICS file
        var icshref = [
            "BEGIN:VCALENDAR",
            "PRODID:-//Microsoft Corporation//Outlook 12.0 MIMEDIR//EN",
            "VERSION:2.0",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",icsdateStart,icsdateEnd,
            "SUMMARY:" + escapeICS(selectedEvent.title),
            selectedEvent.location && ("LOCATION:" + escapeICS(selectedEvent.location)),
            "DESCRIPTION:" + escapeICS(selectedEvent.message),
            hasLink ? "URL:" + escapeICS(selectedEvent.weblink) : "",
            "END:VEVENT","END:VCALENDAR"
        ].join("\n");
        // set ics href
        $("#addics").attr('href','data:text/calendar;charset=utf8,' + escape(icshref));

        //show event ad
        if (selectedEvent.ad != null) {
            $('#eventAd').html(
                '<a href="' + window.location.origin + '/calendar/uploadFiles/adUploads/' + selectedEvent.ad.trim() + '" target="_blank">' +
                '<img src="' + window.location.origin + '/calendar/uploadFiles/adUploads/'+ selectedEvent.ad.trim()+'"></a>'
                );
        } else {
            $('#eventAd').html('');
        }

        //show the event container
        $('#eventContainer').hide().fadeIn();
        QueryString.id = false;
    }

    function triggerClick (day) {
        var tmp = '.calendar-day-' + day;
        $(tmp).trigger('click');
    }

    function parseTime (time) {
        if (time == '12:00am') {
            return 'All day';
        } else {
            return time;
        }
    }

// CALENDAR
    $('#calendarView').clndr({
        template: $('#calendar-template').html(),
        startWithMonth: QueryString.date || moment(),
        clickEvents: {
            click: function (target) {
                var selectedDate = moment(target.date).format('YYYY-MM-DD');
                datefilter.eventdate = selectedDate;
                // console.log(datefilter.eventdate);
                $('.day').removeClass('highlighted');
                $(target.element).addClass('highlighted');
                renderEventList();
                window.history.pushState("","", window.location.pathname + '?date=' + datefilter.eventdate );
            },
            nextMonth: function(target) {
                var zmonth = moment(target).format('MM');
                var zyear = moment(target).format('YYYY');
                window.history.pushState("","", window.location.pathname + '?date=' + moment(target).format('YYYY-MM-DD') );
                QueryString.date = moment(target).format('YYYY-MM-DD');
                // window.location.href = window.location.pathname + '?year=' + zyear + '&month=' + zmonth + '&day=01';
                getData(zmonth, zyear);
                triggerClick(QueryString.date);
            },
            previousMonth: function(target) {
                var zmonth = moment(target).format('MM');
                var zyear = moment(target).format('YYYY');
                window.history.pushState("","", window.location.pathname + '?date=' + moment(target).format('YYYY-MM-DD') );
                QueryString.date = moment(target).format('YYYY-MM-DD');
                // window.location.href = window.location.pathname + '?year=' + zyear + '&month=' + zmonth + '&day=01';
                getData(zmonth, zyear);
                triggerClick(QueryString.date);
            },
        },
        doneRendering: function(){ 
            if (QueryString.date) {
                triggerClick(QueryString.date);
            };
        },
        forceSixRows: true,
        showAdjacentMonths: true,
        adjacentDaysChangeMonth: false
    });

    
    if (QueryString.date) {
        var zmonth = moment(QueryString.date).format('MM');
        var zyear = moment(QueryString.date).format('YYYY');
        getData(zmonth, zyear);
    } else {
        getData();
        $('.today').trigger('click');
    }

    function escapeICS(text) {
        return text.replace(/(\\|;|,)/g,"\\$0").replace(/(\r\n|\r|\n|<br>|<p>)/g,"\\n")
    }
    function dateICS(text) {
        return text.replace(/[:-]|\.[0-9]{3}/g,"");
    }





