var $searchField;
var $resultDiv;
var $modal;
var $coverImage;
var $recogStatus;
var $modalTitle;
var $searchBtn;

$(document).ready(function() {
	$searchField = $("#searchField");
	$resultDiv = $("#results");
	$modal = $("#coverModal");
	$coverImage = $("#coverImage");
	$recogStatus = $("#recogStatus");
	$modalTitle = $(".modal-title",$modal);
	$searchBtn = $("#searchBtn");
	
	$searchBtn.on("click", handleSearch);
	
	$("body").on("click","#results img",doCover);
});

function handleSearch(e) {
	e.preventDefault();
	var value = $.trim($searchField.val());
	if(value === '') return;
	$searchBtn.attr("disabled","disabled");
	console.log('ok, lets search for '+value);
	$resultDiv.html("<i>Searching...</i>");
	$.post("/search", {q:value}, function(res) {
		//result is an array of cover images
		var s = "";
		if(res.images.length) {
			for(var x=0;x<res.images.length;x++) {
				s += "<img src='" + res.images[x].url + "' title='" + res.images[x].title + "' class='img-thumbnail'>";
			}
			s += "<p><i>"+res.attribution+"</i></p>";
		} else {
			s = "<p>Sorry, but there were no matches.</p>";
		}
		$resultDiv.html(s);	
		$searchBtn.removeAttr("disabled");

	});
}

function doCover(e) {
	//default loading msg
	var loadingMsg = "<i>I'm now sending this image to the Bluemix Image scanner. Millions of little baby kittens are running on little treadmills to power the machine behind this scan. I hope you appreciate it!</i>";
	var title = $(this).attr("title");
	var src = $(this).attr("src");
	
	$modalTitle.text(title);
	$coverImage.attr("src",src);
	$recogStatus.html(loadingMsg);
	$modal.modal('show');
	
	$.post("/imagescan", {url:src}, function(res) {
		var s = "<ul>";
		for(var i=0;i<res.length;i++) {
			s += "<li>" + res[i].label_name + "</li>";
		}
		s += "</ul>";
		$recogStatus.html(s);
	},"JSON");
}