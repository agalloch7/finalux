// CATEGORY SELECTION
    $('.panel-collapse.top-lvl:lt(2)').collapse('show');
    //Clicking the category text
    $('span.cat').click(function () {
            // if top-lvl, select all child checkboxes and open collapse
            if ($(this).hasClass('top-lvl')) {
                var topLvl = $(this).closest('.panel');
                if ( topLvl.children('.panel-collapse').hasClass('in') ) {
                    // hide collapse
                    topLvl.children('.panel-collapse').collapse('hide');
                    //change the glyphicons
                    // topLvl.find('.glyphicon').removeClass("glyphicon-minus").addClass("glyphicon-plus");
                    topLvl.children().children('.expandBtn').children('.glyphicon').removeClass("glyphicon-minus").addClass("glyphicon-plus");
                } else {
                    // show collapse
                    topLvl.children('.panel-collapse').collapse('show');
                    //change the glyphicons
                    // topLvl.find('.glyphicon').removeClass("glyphicon-plus").addClass("glyphicon-minus");
                    topLvl.children().children('.expandBtn').children('.glyphicon').removeClass("glyphicon-plus").addClass("glyphicon-minus");
                }
                // check all child checkboxes
                // topLvl.find('input[type=checkbox]').prop('checked',true);
            } else {
                // remove all checked
                // $('input[type=checkbox]').prop('checked', false);
                // check related checkbox
                if ($(this).siblings('input[type=checkbox]').prop('checked')) {
                    $(this).siblings('input[type=checkbox]').prop('checked', false);
                } else {
                    $(this).siblings('input[type=checkbox]').prop('checked', true);
                };
                renderEventList();
            };
        });
    $('input.sub-event').change(function () {
        renderEventList();
    });
    // Clicking top-lvl checkbox
    $('input.top-lvl').change(function () {
        var topLvl = $(this).closest('.panel');
        if ($(this).prop('checked')) {
                // check all child checkboxes
                topLvl.find('input[type=checkbox]').prop('checked',true);
                // show all collapsible elements
                topLvl.find('.panel-collapse').collapse('show');
                //change the glyphicons
                topLvl.find('.glyphicon').removeClass("glyphicon-plus").addClass("glyphicon-minus");
            } else {
                // uncheck all child checkboxes
                topLvl.find('input[type=checkbox]').prop('checked',false);
                // hide the first collapsible element
                // topLvl.children('.panel-collapse').collapse('hide');
                // change the first glyphicon
                // $(this).siblings('span').children('.glyphicon').removeClass("glyphicon-minus").addClass("glyphicon-plus");
           }
           renderEventList();
       })
    // Clicking the expand button
    $('.expandBtn').click(function (e) {
        e.preventDefault();
        var topLvl = $(this).closest('.panel');
        if ($(this).children('.glyphicon').hasClass('glyphicon-plus')) {
            // show first collapse
            topLvl.children('.panel-collapse').collapse('show');
            // change this glyphicon
            $(this).children('.glyphicon').removeClass("glyphicon-plus").addClass("glyphicon-minus");
        } else {
            // hide the first collapse
            topLvl.children('.panel-collapse').collapse('hide');
            // change this glyphicon
            $(this).children('.glyphicon').removeClass("glyphicon-minus").addClass("glyphicon-plus");
        }
    });