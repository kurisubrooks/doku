$(function() {
    $("form").on("submit", function(event) {
        event.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();

        if (!username || !password) {
            console.log("missing all entries");
            return;
        }

        $.post("/api/login", { username: username, password: password }, function(data) {
            /*if (data.ok) {
                window.location.replace("/panel/me");
            } else {
                $(".error").show();
                $("#errmsg").text(data.error);
                return;
            }*/
        });

        return;
    });
});
