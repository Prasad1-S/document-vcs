$(function(){

        $(".toggle").on("click", function(){
            // visually mark active toggle
            $(".toggle").removeClass("active");
            $(this).addClass("active");

            if ($(this).hasClass("Register_toggle")){
                $(".createAccount").removeClass("hide").addClass("show");
                $(".loginAccount").removeClass("show").addClass("hide");
            } else if ($(this).hasClass("Login_toggle")){
                $(".loginAccount").removeClass("hide").addClass("show");
                $(".createAccount").removeClass("show").addClass("hide");
            }
        });

        // Initial state: show register, hide login, set active toggle
        $(".createAccount").addClass("show");
        $(".loginAccount").addClass("hide");
        $(".toggle").removeClass("active");
        $(".Register_toggle").addClass("active");

        //register account

        $(".register").on("click", function(){
            // validate credentials
            console.log("got clicked!!");
        })
});