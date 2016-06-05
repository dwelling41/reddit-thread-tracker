toastr.options = {
	"positionClass": "toast-top-center"
}

window.util = {
	post: function(url, data, successCb, errorCb) {
		return $.ajax({
		  url:url,
		  type:"POST",
		  data:JSON.stringify(data),
		  contentType:"application/json; charset=utf-8",
		  dataType:"json",
		  success: successCb,
		  error: errorCb
		});
	}

}
