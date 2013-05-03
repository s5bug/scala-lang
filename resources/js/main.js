---
---

/*************************
 * Various functionality
 ************************/

function getOS() {
  var osname = "Unknown OS";
  if (navigator.appVersion.indexOf("Win") != -1) osname = "Windows";
  if (navigator.appVersion.indexOf("Mac") != -1) osname = "Mac OS";
  if (navigator.appVersion.indexOf("Linux") != -1) osname = "Linux";
  if (navigator.appVersion.indexOf("X11") != -1) osname = "UNIX";
  return osname;
}


/***************************
 * Document initialization
 **************************/
$(document).ready(function(){

  // background image on frontpage
  $(".splash").backstretch("{{ site.baseurl }}/resources/img/view-leman-opt2.jpg");

  // tooltips (front page)
  $(".marker").mouseover(function(){ $(".tip").show(); });
  $(".marker").mouseout(function(){ $(".tip").hide(); });

  $("#source-code").mouseover(function(){ $(this).find(".toptip").show(); });
  $("#source-code").mouseout(function(){ $(this).find(".toptip").hide(); });
  $("#scala-lang-twitter").mouseover(function(){ $(this).find(".toptip").show(); });
  $("#scala-lang-twitter").mouseout(function(){ $(this).find(".toptip").hide(); });

  // same height hack for scala in a nutshell boxes
  var boxes = $('.bullet-point').not(".span12");
  maxHeight = Math.max.apply(
    Math, boxes.map(function() {
        return $(this).height();
  }).get());
  boxes.height(maxHeight);

  // expanding code snippets (front page)
  function expandSnippetAction(snippetID, container) {
    var codeBox = container.find(".row");

    function go() {
      var snippet = $(snippetID).html();

      // for positioning the arrow
      var arrow = $(this).parent().siblings(".code-snippet-arrow");
      var centerPoint = $(this).position().left + $(this).width()/2;
      arrow.css("left", centerPoint);

      var codeSnippetInContainer = codeBox.html();

      if (container.is(":hidden")) {
        arrow.show();
        codeBox.html(snippet);
        container.slideDown();
      } else if (codeSnippetInContainer == snippet) {
        container.slideUp(function() {
          arrow.hide();
        });
      } else {
        var hgt = $(snippetID).height();
        codeBox.html(snippet);
        codeBox.animate({height: hgt}, 400);
      }
    }
    return go;
  }

  var row1 = $("#code-snippet-row1");
  var row2 = $("#code-snippet-row2");

  $("#java-interop").click(expandSnippetAction("#hidden-java-interop", row1));
  $("#type-inference").click(expandSnippetAction("#hidden-type-inference", row1));
  $("#parallelism-distribution").click(expandSnippetAction("#hidden-parallelism-distribution", row1));

  $("#traits").click(expandSnippetAction("#hidden-traits", row2));
  $("#pattern-matching").click(expandSnippetAction("#hidden-pattern-matching", row2));
  $("#higher-order-functions").click(expandSnippetAction("#hidden-higher-order-functions", row2));

  // code example carousel
  $('.carousel').carousel();
  $(document).keyup(function(event) {
    switch (event.keyCode) {
      case 37: // lef t
        $('.carousel').carousel('prev');
        break;
      case 39: // right
        $('.carousel').carousel('next');
        break;
      default:
        break;
    }
  });

  // tweets
  $(function(){
    $("#tweets").liveTwitter('scala_lang');
  });

});

<!-- prettyprint js to prepend generated pre/code tags -->
$(document).ready(styleCode);
function styleCode() {
  if (typeof disableStyleCode != "undefined") {
    return;
  }
  var a = false;
  $("pre code").parent().each(function() {
    if (!$(this).hasClass("prettyprint")) {
      $(this).addClass("prettyprint lang-scala linenums");
      a = true
    }
  });
  if (a) { prettyPrint() }
}


/***********************
 * Download page
 **********************/

$(document).ready(function() {
  var os = getOS();
  if (os == "Unknown OS") os = "UNIX";

  $("#os_name").append(os);

  // Do not do any of the following if we're not on a download page
  // Otherwise a TypeError is raised and disables all other scripts on the page
  if ($("#download-space").length == 0)
    return;

  var imageurl = "/resources/img/scala-small-logo.png";
  if (os == "Windows") {
    imageurl = "/resources/img/logos/Windows_logo.png";
  } else if (os == "Mac OS") {
    imageurl = "/resources/img/logos/Apple_logo.png";
  } else if (os == "Linux") {
    imageurl = "/resources/img/logos/Tux.svg";
  }

  var anchor = document.getElementById("#link-main-unixsys");
  if (os == "Windows") {
    anchor = document.getElementById("#link-main-windows");
  }
  if (anchor == null) anchor = document.getElementById("#link-main-one4all");
  var link = anchor.getAttribute("href");

  $("#download-space").append(
    $('<a>', {href: link, class: 'btn download'}).append(
      $('<img>', {src: imageurl})
    ).append(
      $('<br>')
    ).append("Download Scala for " + os)
  );
});

/***********************
 * Main Page Download Button
 **********************/

$(document).ready(function() {
  var os = getOS();
  if (os == "Unknown OS") os = "UNIX";
  var hiddenDownload = $("#link-main-unixsys");
  if (os == "Windows") {
    hiddenDownload = $("#link-main-windows");
  }
  // get the right download link in place
  var downloadLink = $("#download-btn");
  if (downloadLink.length > 0) {
    downloadLink.text("Download for " + os);
    downloadLink.prop("href", hiddenDownload.attr("href"));
  }

});



/******************************
 * Events and trainings feeds *
 ******************************/

$(document).ready(function(){
  var $eventsAndTrainingDiv = $('#eventsAndTraining');

  var MAX_EVENTS = 5;
  var MAX_TRAININGS = 5;

  // Stop early if the element does not exist
  if ($eventsAndTrainingDiv.length == 0)
    return;

  function compareFormattedDates(lhs, rhs) {
    var lhsDate = new Date(lhs);
    var rhsDate = new Date(rhs);
    if (lhsDate < rhsDate)
      return -1;
    else if (lhsDate > rhsDate)
      return 1;
    else
      return 0;
  }

  // EVENTS

  function compareEventsByDate(lhs, rhs) {
    return compareFormattedDates(lhs.start, rhs.start);
  }

  var scalaLangEvents = [
  {% for event in site.categories.events %}
  {% if event.date >= site.time %}{% comment %} No point in including outdated events {% endcomment %}
    {
      "title": "{{ event.title }}",
      "logo": "{{ event.logo }}",
      "location": "{{ event.location }}",
      "start": "{{ event.start }}",
      "end": "{{ event.end }}",
      "url": "{{ event.link-out }}",
    },
  {% endif %}
  {% endfor%}
  ];

  function doPopulateEventsPane(allEvents) {
    allEvents = allEvents.filter(function (event) {
      return (event.end ? new Date(event.end) : new Date(event.start)) >= new Date();
    });
    allEvents.sort(compareEventsByDate);
    var content = "";
    for (i = 0; i < allEvents.length && i < MAX_EVENTS; i++) {
      var event = allEvents[i];
      var thisContent =
        '<div class="event-item">' +
          '<div class="event-title"><a href="'+event.url+'">'+event.title+'</a></div>' +
          '<div class="event-logo"><img class="event-logo" src="'+event.logo+'" alt="Logo" /></div>' +
          '<div class="event-location">'+event.location+'</div>' +
          '<div class="event-date"><img src="{{ site.baseurl }}/resources/img/icon-date.png" /> '+
            event.start + (event.end ? ' to '+event.end : '') + '</div>' +
        '</div>';
      $("#eventspane").append(thisContent);
    }
  };

  function onEventsAjaxSuccess(response, textStatus, jqXHR) {
    var allEvents = scalaLangEvents.concat(response);
    doPopulateEventsPane(allEvents);
  }

  function onEventsAjaxError(jqXHR, textStatus, errorThrown) {
    // log the error to the console
    console.error(
      "Could not load Typesafe event feed: " + textStatus, errorThrown);
    // but at least display events from scala-lang
    doPopulateEventsPane(scalaLangEvents);
  }

  $.ajax({
    url: "{{ site.baseurl }}/cgi-bin/typesafe-feed-events",
    type: "GET",
    dataType: "json",
    success: onEventsAjaxSuccess,
    error: onEventsAjaxError
  });

  // TRAININGS

  function compareTrainingsByDate(lhs, rhs) {
    return compareFormattedDates(lhs.when, rhs.when);
  }

  var scalaLangTrainings = [
  {% for training in site.categories.training %}
  {% if training.date >= site.time %}{% comment %} No point in including outdated training sessions {% endcomment %}
    {
      title: "{{ training.title }}",
      description: "{{ training.description }}",
      url: "{{ training.link-out }}",
      sessions: [
        {
          where: "{{ training.where }}",
          when: "{{ training.when }}",
          trainers: "{{ training.trainers }}",
          organizer: "{{ training.organizer }}",
          status: "{{ training.status }}"
        }
      ]
    },
  {% endif %}
  {% endfor%}
  ];

  function keepOnlyOneSession(trainings) {
    var result = new Array();
    for (i = 0; i < trainings.length && i < MAX_TRAININGS; i++) {
      var training = trainings[i];
      var firstSession = training.sessions[0];
      result[i] = {
        title: training.title,
        description: training.description,
        url: training.url,
        where: firstSession.where,
        when: firstSession.when,
        trainers: firstSession.trainers,
        organizer: firstSession.organizer,
        status: firstSession.status
      };
    }
    return result;
  }

  function doPopulateTrainingsPane(allTrainings0) {
    var allTrainings = keepOnlyOneSession(allTrainings0);
    allTrainings = allTrainings.filter(function (training) {
      return new Date(training.when) >= new Date();
    });
    allTrainings.sort(compareTrainingsByDate);
    var content = "";
    for (i = 0; i < allTrainings.length; i++) {
      var training = allTrainings[i];
      var thisContent =
        '<div class="training-item">' +
          '<div class="training-title"><a href="'+training.url+'">'+training.title+'</a></div>' +
          '<div class="training-description">'+training.description+'</div>' +
          '<div class="training-location">'+training.where+'</div>' +
          '<div class="training-date"><img src="{{ site.baseurl }}/resources/img/icon-date.png" /> '+training.when+'</div>' +
          '<div class="training-trainers"><span class="by">By</span> <div class="training-trainers-name">'+training.trainers+'</div></div>' +
          '<div class="training-organizer">'+training.organizer+'</div>' +
        '</div>';
      $("#trainingspane").append(thisContent);
    }
  }

  function onTrainingsAjaxSuccess(response, textStatus, jqXHR) {
    var allTrainings = scalaLangTrainings.concat(response);
    doPopulateTrainingsPane(allTrainings);
  }

  function onTrainingsAjaxError(jqXHR, textStatus, errorThrown) {
    // log the error to the console
    console.error(
      "Could not load Typesafe training feed: " + textStatus, errorThrown);
    // but at least display trainings from scala-lang
    doPopulateTrainingsPane(scalaLangTrainings);
  }

  $.ajax({
    url: "{{ site.baseurl }}/cgi-bin/typesafe-feed-trainings",
    type: "GET",
    dataType: "json",
    success: onTrainingsAjaxSuccess,
    error: onTrainingsAjaxError
  });

});

/**************************
 * Community tickets feed *
 **************************/

$(document).ready(function(){
  var $communityTicketsDiv = $('#communitytickets');

  // Stop early if the element does not exist
  if ($communityTicketsDiv.length == 0)
    return;

  var MAX_TICKETS_PER_PAGE = 20;

  function escapeHTML(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function doPopulateTicketsPane(data) {
    var pageCount = Math.ceil(data.total / data.maxResults);
    var currentPage = Math.floor(data.startAt / data.maxResults) + 1;

    $("#communitytickets").empty();

    var pagerList = $('<ul>');

    for (var i = 0; i <= pageCount+1; i++) {
      var page, buttonText;
      if (i == 0) {
        page = currentPage-1;
        buttonText = '«';
      } else if (i > pageCount) {
        page = currentPage+1;
        buttonText = '»';
      } else {
        page = i;
        buttonText = i.toString();
      }

      var valid = (page >= 1) && (page <= pageCount);
      var item;

      if (valid) {
        var clickFun = (function(startAt) {
          return function() {
            doAjaxQuery(startAt);
            return false;
          }
        })((page-1) * data.maxResults);

        var anchor = $('<a>', {
          href: '#',
          text: buttonText,
          click: clickFun
        });
        item = $('<li>', {
          class: page == currentPage ? 'active' : ''
        }).append(anchor);
      } else {
        var anchor = $('<a>', {
          href: '#',
          text: buttonText,
          click: function() {
            return false;
          }
        });
        item = $('<li>', {
          class: 'disabled'
        }).append(anchor);
      }

      pagerList.append(item);
    }

    $("#communitytickets").append(
      $('<div>', {class: 'pagination'}).append(pagerList)
    );

    var issues = data.issues;
    for (i = 0; i < issues.length; i++) {
      var issue = issues[i];
      var fields = issue.fields;

      /* Note: if you want to add more fields (or remove some), be sure to
       * update the query URL below, in doAjaxQuery(), so that the 'fields'
       * parameter contains the list of fields you want to receive.
       */
      var thisContent =
        '<hr /><div class="tickets-item">' +
          '<div class="tickets-title"><a href="https://issues.scala-lang.org/browse/'+issue.key+'">'+escapeHTML(fields.summary)+'</a></div>' +
          '<div class="tickets-issuetype"><img src="'+fields.issuetype.iconUrl+'" /> '+escapeHTML(fields.issuetype.name)+'</div>' +
          '<div class="tickets-priority"><img src="'+fields.priority.iconUrl+'" /> '+escapeHTML(fields.priority.name)+'</div>' +
          '<div class="tickets-components">'+fields.components.map(function (component) {
            return '<a href="https://issues.scala-lang.org/browse/SI/component/'+component.id+'">'+escapeHTML(component.name)+'</a>';
          }).join(', ')+'</div>'+
          '<div class="tickets-description">'+escapeHTML(fields.description)+'</div>'+
          // '<div class="tickets-data"><pre>'+JSON.stringify(issue, undefined, 2)+'</pre></div>' +
        '</div>';

      $("#communitytickets").append(thisContent);
    }
  };

  function onAjaxSuccess(response, textStatus, jqXHR) {
    doPopulateTicketsPane(response);
  }

  function onAjaxError(jqXHR, textStatus, errorThrown) {
    // log the error to the console
    console.error(
      "Could not load community tickets from JIRA: " + textStatus, errorThrown);
  }

  function doAjaxQuery(startAt) {
    /* Note: the 'fields' parameter contains the list of fields we use in
     * the construction of the display, in doPopulateTicketsPane().
     */
    $.ajax({
      url: "https://issues.scala-lang.org/rest/api/2/search?jql=project+in+%28SI,SUGGEST%29+AND+status+%3D+Open+AND+labels+%3D+community+ORDER+BY+component&maxResults="+MAX_TICKETS_PER_PAGE+'&startAt='+startAt+'&fields=summary,issuetype,priority,components,description',
      type: "GET",
      dataType: "jsonp",
      jsonp: 'jsonp-callback',
      crossDomain: true,
      success: onAjaxSuccess,
      error: onAjaxError
    });
  }

  doAjaxQuery(0);

});

/**************************
 * Google Analytics       *
 **************************/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-574683-6']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
var f = function(event){
  var href = $(this).attr('href');
  var target = $(this).attr('target');
  _gaq.push(['_trackEvent','Downloads','Download',href]);
  if (target === undefined || target.toLowerCase() != '_blank') {
    setTimeout(function() { location.href = href; }, 200);
    return false;
  }
};
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
$(function(){
  $('a').filter(function(){
    var href = $(this).attr('href');
    return !(endsWith(href,'/') || endsWith(href,'html') || $(this).hasClass('no-analytics'));
  }).click(f);
});



