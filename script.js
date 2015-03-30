/* application init */
$(document).ready(function(){
	/* center introduction on load or resize */
	var ActiveSectionId = "section#introduction"
	WeMeet.center(ActiveSectionId,false)
	$( window ).resize(function() {
	  WeMeet.center(ActiveSectionId,false)
	});
	$("#facebook-login").click(function(){
		$(this).attr("disabled", true)	
		console.log("Because fuck you that's why.")
	})
});

/* library */
var WeMeet = {
	/* center active section */
	center: function(ActiveSectionId,animate,reveal){
		var introMargins = ($(window).height() - $(ActiveSectionId).height()) / 2
		if(animate){
			$(ActiveSectionId).show("slow").animate({ 
			    'padding' : introMargins+"px 0px"
			}, "slow");
		}
		else{
			$(ActiveSectionId).removeAttr("hidden")
			$(ActiveSectionId).css("padding",introMargins+"px 0px")
		}
	},
	/* hide */
	fadeaway: function(InactiveSectionId){
		$(InactiveSectionId).slideUp("slow")
	}
};