var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function() {
    var text = $(this)
        .text()
        .trim();
    var textInput = $("<textarea>")
        .addClass("form-control")
        .val(text);
    $(this).replaceWith(textInput);
    textInput.trigger("focus"); //adds the blue focus border
});

$(".list-group").on("blur", "textarea", function() { //when it loses focuses (off of above function)
    // get the textarea's current value/text
    var text = $(this)
        .val()
        .trim();

    // get the parent ul's id attribute
    var status = $(this)
        .closest(".list-group")
        .attr("id")
        .replace("list-", "");

    // get the task's position in the list of other li elements
    var index = $(this)
        .closest(".list-group-item")
        .index();
    //save task and tasks array
    tasks[status][index].text = text;
    saveTasks();
    // recreate p element
    var taskP = $("<p>")
        .addClass("m-1")
        .text(text);
    // replace textarea with p element
    $(this).replaceWith(taskP);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// due date was clicked
$(".list-group").on("click", "span", function() {
    // get current text
    var date = $(this)
      .text()
      .trim();
  
    // create new input element
    var dateInput = $("<input>")
      .attr("type", "text") //one argument gets attribute, two gets and sets the attribute (so type=text here)
      .addClass("form-control")
      .val(date);
  
    // swap out elements
    $(this).replaceWith(dateInput);
  
    // automatically focus on new element
    dateInput.trigger("focus");
});

// value of due date was changed (loses focus)
$(".list-group").on("blur", "input[type='text']", function() {
    // get current text
    var date = $(this)
      .val()
      .trim();
  
    // get the parent ul's id attribute
    var status = $(this)
      .closest(".list-group")
      .attr("id")
      .replace("list-", "");
  
    // get the task's position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();
  
    // update task in array and re-save to localstorage
    tasks[status][index].date = date;
    saveTasks();
  
    // recreate span element with bootstrap classes
    var taskSpan = $("<span>")
      .addClass("badge badge-primary badge-pill")
      .text(date);
  
    // replace input with span element
    $(this).replaceWith(taskSpan);
});

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) { //when dragging starts
    console.log("activate", this);
  },
  deactivate: function(event) { //when dragging stops
    console.log("deactivate", this);
  },
  over: function(event) { //enters a connected list
    console.log("over", event.target);
  },
  out: function(event) { //leaves a connected list
    console.log("out", event.target);
  },
  update: function(event) { //when list contents have changed
      // array to store the task data in
      var tempArr = [];

      // loop over current set of children in sortable list
      $(this).children().each(function() {
        var text = $(this)
          .find("p")
          .text()
          .trim();

        var date = $(this)
          .find("span")
          .text()
          .trim();

        // add task data to the temp array as an object
        tempArr.push({
          text: text,
          date: date
        });
      });
      // trim down list's ID to match object property
      var arrName = $(this)
        .attr("id")
        .replace("list-", "");

      // update array on tasks object and save
      tasks[arrName] = tempArr;
      saveTasks();
      console.log(tempArr);
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove(); //removing a tasks triggers an update(), so we don't need to saveTasks()
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// load tasks for the first time
loadTasks();