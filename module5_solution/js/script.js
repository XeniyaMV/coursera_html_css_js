$(function () { // Same as document.addEventListener("DOMContentLoaded"...

    // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
    $("#navbarToggle").blur(function (event) {
      var screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        $("#collapsable-nav").collapse('hide');
      }
    });
});

(function (global) {
  // namespace for David Chu's
  var dc = {};
  var homeHtml = "snippets/home-snippet.html";
  
  var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  
  var menuItemsUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Convivience function for inserting innerHTML for 'select'
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Show loading icon inside element identified by 'selector'
  var showLoading = function (selector) {
    var html = "<div class='text center'>";
    html += "<img srs='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Return substitute of '{{propName}}'
  // with propValue in given 'string'
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    // * "g" - is the flag that stands for replacing each "propToReplace" in the string with "propValue" 
    if (propValue) {
      string = string.replace(new RegExp(propToReplace, "g"), propValue);
    }
    else {
      string = string.replace(new RegExp(propToReplace, "g"), "");
    }
    return string;
  }

  var insertPriceProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    if (propValue) {
      //toFixed(2) - put 2 zeros after point, for example: 2 => 2.00
      string = string.replace(new RegExp(propToReplace, "g"), "$" + propValue.toFixed(2));
    }
    else {
      string = string.replace(new RegExp(propToReplace, "g"), "");

    }
    return string;
  }

  var insertPortionProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";

    if (propValue) {
      string = string.replace(new RegExp(propToReplace, "g"), "(" + propValue + ")");
    }
    else {
      string = string.replace(new RegExp(propToReplace, "g"), "");
    }
    return string;
  }

  //Remove the class 'active' from home and switch to Menu button
  var switchMenuToActive = function () {
    //Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // On page load (before images or CSS)
  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(homeHtml, function (responseText) {
      document.querySelector("#main-content").innerHTML = responseText;
    }, false);
  });

  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  }

  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(menuItemsUrl+categoryShort, buildAndShowMenuItemsHTML);
  }

  // Builds HTML for the categories page based on the data from server
  function buildAndShowCategoriesHTML (categories) {
    // Load title snippet of categories page
    $ajaxUtils.sendGetRequest(categoriesTitleHtml, function(categoriesTitleHtml){
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(categoryHtml, function(categoryHtml){
        switchMenuToActive();

        var categoriesViewHtml = buildCategoriesViewHtml(categories,
                                                         categoriesTitleHtml,
                                                         categoryHtml);
        insertHtml("#main-content", categoriesViewHtml);
      }, false);
    }, false);
  }

  // Using categories data and snippets html
  // build categories view html to be inserted into page
  function buildCategoriesViewHtml (categories, categoriesTitleHtml, categoryHtml) {
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // loop over categories
    for (var i = 0; i < categories.length; i++) {
      // Insert category values
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }
    finalHtml += "</section>";

    return finalHtml;
  }

  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml) {
      $ajaxUtils.sendGetRequest(menuItemHtml, function (menuItemHtml) {
        var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
        insertHtml("#main-content", menuItemsViewHtml);
      }, false);
    }, false);
  }

  function buildMenuItemsViewHtml (categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
    var finalHtml = menuItemsTitleHtml;
    finalHtml = insertProperty(finalHtml, 'name', categoryMenuItems['category']['name']);
    finalHtml = insertProperty(finalHtml, 'special_instructions', categoryMenuItems['category']['special_instructions']);
    finalHtml += "<section class='row'>";
   var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < categoryMenuItems['menu_items'].length; i++) {
      var html = menuItemHtml;
      for (j in categoryMenuItems['menu_items'][i]) {
        
        if (j.indexOf('price') != -1) {
          html = insertPriceProperty(html, j, categoryMenuItems['menu_items'][i][j]);
        }
        else if (j.indexOf('portion') != -1) {
          html = insertPortionProperty(html, j, categoryMenuItems['menu_items'][i][j]);
        }
        else {
          html = insertProperty(html, j, categoryMenuItems['menu_items'][i][j]);
        }
        html = insertProperty(html, "catShortName", catShortName);
      }
      // Add clearfix after every second menu item
      if (i % 2 != 0) {
        html += "<div class='clearfix visible-md-block visible-lg-block></div>";
      }
      finalHtml += html;
    }
    finalHtml += '</section>';
    return finalHtml;
  }

  global.$dc = dc;
})(window);