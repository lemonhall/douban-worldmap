(function() {
    var b = window.white_site_list || /http:\/\/movie\.douban\.com\/sogou_search|http:\/\/audit\.douban\.com|http:\/\/web2\.qq\.com|http:\/\/web\.qq\.com|http:\/\/web3\.qq\.com/;
    if (self !== top && document.referrer.search(b) === -1) {
        top.location = self.location
    }
})();
Do = (typeof Do === "undefined") ? function(b) {
    setTimeout(b, 0)
} : Do;
Douban = new Object();
Douban.errdetail = ["", "未知错误", "文件过大", "信息不全", "域名错误", "分类错误", "用户错误", "权限不足", "没有文件", "保存文件错误", "不支持的文件格式", "超时", "文件格式有误", "", "添加文件出错", "已经达到容量上限", "不存在的相册", "删除失败", "错误的MP3文件", "有禁用的内容,请修改重试"];
var trace = function(b) {
    if (!/^http:\/\/(www|movie|music\.|book|douban\.fm)/.test(location.href) && window.console && window.console.log) {
        console.log(b)
    }
};
var report = function(b) {
    $.get("/j/report?e=" + b)
};
Douban.EventMonitor = function() {
    this.listeners = new Object()
};
Douban.EventMonitor.prototype.broadcast = function(c, f, d) {
    var b = this.listeners[f];
    if (b != null) {
        for (var e in b) {
            b[e](c, d)
        }
    }
};
Douban.EventMonitor.prototype.subscribe = function(c, d) {
    var b = this.listeners[c];
    if (b) {
        b.push(d)
    } else {
        this.listeners[c] = [d]
    }
};
Douban.EventMonitor.prototype.unsubscribe = function(c, d) {
    var b = this.listener[c];
    if (b != null) {
        b = b.filter(function(g, f, e) {
            return g != d
        })
    }
};
var event_monitor = new Douban.EventMonitor();
function load_event_monitor(root) {
    var re = /a_(\w+)/;
    var fns = {};
    $(".j", root).each(function(i) {
        var m = re.exec(this.className);
        if (m) {
            var actionName = m[1], f = fns[actionName];
            if (!f) {
                f = eval("Douban.init_" + actionName);
                fns[actionName] = f
            }
            f && f(this)
        }
    })
}
function request_log_ad_displays() {
    $('div[id^="daslot"]').each(function(b) {
        var c = $(this).attr("id");
        params = c.split("-");
        $.get("/j/da/view?da=" + params[1] + "&dag=" + params[2] + "&dac=" + params[3] + "&p=" + params[4] + "&kws=" + params[5])
    })
}
Douban.prettify_form = function(b) {
    $("input:submit", b).each(function(d) {
        var c = $('<a href="#" class="butt"></a>').text($(this).val());
        c.click(function() {
            if (clean_tip()) {
                b.submit()
            }
            return false
        });
        $(this).hide().after(c)
    })
};
var get_form_fields = function(b) {
    var c = {};
    $(":input", b).each(function(e) {
        var d = this.name;
        if (this.type == "radio") {
            if (this.checked) {
                c[d] = this.value
            }
        } else {
            if (this.type == "checkbox") {
                if (this.checked) {
                    c[d] = this.value
                }
            } else {
                if (this.type == "submit") {
                    if (/selected/.test(this.className)) {
                        c[d] = this.value
                    }
                } else {
                    if (d) {
                        c[d] = this.value
                    }
                }
            }
        }
        if (/notnull/.test(this.className) && this.value == "") {
            $(this).prev().addClass("errnotnull");
            c.err = "notnull"
        }
    });
    return c
};
var remote_submit_json = function(f, e, c, g) {
    var d = get_form_fields(f);
    if (d.err != undefined) {
        return
    }
    $(":submit,:input", f).attr("disabled", c == false ? 0 : 1);
    var b = g || f.action;
    $.post_withck(b, d, function(h) {
        e(h)
    }, "json")
};
Douban.init_evb = function(o) {
    var eid = $(o).attr("id").split("-")[1];
    $(o).submit(function() {
        var url = "/j/entry/" + eid + "/vote";
        $.post_withck(url, function(ret) {
            var r = eval("(" + ret + ")");
            event_monitor.broadcast(this, "entry_" + eid + "_voted", r);
            $(o).text("你的投票已经提交，谢谢。");
            $("#nf-" + eid).hide();
            $("#nf_s-" + eid).hide()
        });
        return false
    })
};
Douban.init_evc = function(c) {
    var b = $(c).attr("id").split("-")[1];
    event_monitor.subscribe("entry_" + b + "_voted", function(d, f) {
        var e = f.rec_count;
        if (e) {
            $(c).text("" + e + "人推荐").removeClass("hidden")
        }
    })
};
Douban.init_enb = function(c) {
    var b = $(c).attr("id").split("-")[1];
    $(c).submit(function() {
        var d = "/j/entry/" + b + "/nointerest";
        $.post_withck(d, function(e) {
            $(c).text("你的投票已经提交，谢谢。");
            $("#a_evb-" + b + ",#evb_s-" + b).hide()
        });
        return false
    })
};
var voteuse_act = function(b, f, e, d) {
    var c = "/j/" + e + "/" + f + (b ? "/useful" : "/useless");
    $.postJSON_withck(c, {}, function(j) {
        if (j.result) {
            if (d) {
                var h = $("#ucount" + f + "u"), g = $("#ucount" + f + "l");
                if ((h.text() == j.usecount) && (g.text() == j.totalcount - j.usecount) && (j.result != "notself")) {
                    alert("你已经投过票了")
                }
                h.html(j.usecount);
                g.html(j.totalcount - j.usecount)
            } else {
                $("#voteuse_" + f).html('<span class="m gtleft">你的投票已经提交，谢谢。</span>');
                $("#userate_" + f).html('<p id="userate_%s" class="pl">' + j.usecount + "/" + j.totalcount + "的人觉得此评论有用:</p>")
            }
        }
        return false
    })
};
var vote_type = function(b) {
    switch (b) {
        case "d":
            return "doulist";
        case "r":
            return "review";
        case "c":
            return "discussion";
        case "s":
            return "song"
    }
};
var voteuseful = function(e, c) {
    var b = e.split("-");
    var d = vote_type(b[0]);
    return voteuse_act(true, b[1], d, c)
};
var voteuseless = function(e, c) {
    var b = e.split("-");
    var d = vote_type(b[0]);
    return voteuse_act(false, b[1], d, c)
};
Douban.init_bef = function(h) {
    var b = $(h).attr("id").split("entry-")[1], g = $(".unfolder", h), d = $(".folder", h), c = $(".entry-summary", h), e = $(".entry-full", h);
    g.click(function() {
        if (e.text() == "") {
            var j = $('<div class="loadtip">正在载入...</div>');
            var f = setTimeout(function() {
                $(".source", h).before(j)
            }, 200);
            var k = "/j/entry/" + b + "/";
            $.getJSON(k, function(l) {
                clearTimeout(f);
                j.hide();
                $.post_withck(k + "view", {});
                e.html(l.content).find("a").attr("target", "_blank");
                e.show();
                c.hide()
            })
        } else {
            e.show();
            c.hide()
        }
        g.hide();
        d.show();
        return false
    }).hover_fold("unfolder");
    d.click(function() {
        c.show();
        e.hide();
        d.hide();
        g.show()
    }).hover_fold("folder")
};
Douban.init_unfolder_n = function(b) {
    $(b).click(function() {
        var d = $(b).attr("id").split("-")[1];
        var c = "/j/note/" + d + "/full";
        $.getJSON(c, function(e) {
            $("#note_" + d + "_short").hide();
            $("#note_" + d + "_full").html(e.html);
            $("#note_" + d + "_full").show();
            $("#note_" + d + "_footer").show();
            $("#naf-" + d).hide();
            $("#nau-" + d).show();
            load_event_monitor($("#note_" + d + "_full"))
        });
        return false
    }).hover_fold("unfolder")
};
Douban.init_folder_n = function(b) {
    $(b).click(function() {
        var c = $(b).attr("id").split("-")[1];
        $("#note_" + c + "_full").hide();
        $("#note_" + c + "_short").show();
        $("#note_" + c + "_footer").hide();
        $(b).hide();
        $("#naf-" + c).show()
    }).hover_fold("folder")
};
Douban.init_unfolder = function(b) {
    $(b).click(function() {
        var e = b.id.split("-")[1];
        var c = b.rel.split("-")[1];
        var d = "/j/review/" + e + "/fullinfo";
        $.getJSON(d, {show_works: c}, function(f) {
            var g = document.createElement("div");
            g.innerHTML = f.html;
            $("#review_" + e + "_short").hide();
            $("#review_" + e + "_full").html("").append(g);
            $("#review_" + e + "_full").show();
            $("#af-" + e).hide();
            $("#au-" + e).show();
            load_event_monitor($("#review_" + e + "_full"))
        });
        return false
    })
};
Douban.init_folder = function(b) {
    $(b).click(function() {
        var c = $(b).attr("id").split("-")[1];
        $("#review_" + c + "_full").hide();
        $("#review_" + c + "_short").show();
        $(b).hide();
        $("#af-" + c).show()
    })
};
Douban.init_bevf = function(j) {
    var e = $(j).attr("id").split("bevs-")[1];
    var g = $(".voters_header", j);
    if (!g.length) {
        return
    }
    g.hover(function() {
        $(this).addClass("clickable_title")
    }, function() {
        $(this).removeClass("clickable_title")
    });
    var d = $("#vsl", j);
    var c = $(".link", j);
    var b = $("#more_voters", j);
    var f = function(l) {
        var k = $(".mv", j);
        if (k.length) {
            var n = k.toggle().css("display");
            c.text(n == "none" ? "更多推荐者" : "隐藏");
            if (b.length) {
                b.toggle().css("display")
            }
        } else {
            t = $("<li>正在装载...</li>");
            if (d.length) {
                d.append(t)
            } else {
                g.after(d = $('<ul id="vsl" class="user-list pl indent"></ul>'));
                d.append(t)
            }
            var h = "/j/entry/" + e + "/voters?start=8";
            $.getJSON(h, function(o) {
                t.css("display", "none");
                t.before($(o.html));
                if (b.length) {
                    b.css("display", "none")
                }
            });
            $(".link", j).text("隐藏")
        }
        return false
    };
    g.click(f);
    c.click(f)
};
Douban.init_guidelink = function(b) {
    $(b).click(function() {
        window.open("/help/guide1", "", "width=640,height=400");
        return false
    })
};
Douban.init_closelink = function(b) {
    $('<a href="#">关闭</a>').appendTo($(b)).click(function() {
        window.close();
        return false
    })
};
function ext_links() {
    es = $(".entry-summary");
    es.each(function(c) {
        var b = $(es[c]).find("a");
        b.each(function(d) {
            b[d].target = "_blank"
        })
    })
}
Douban.init_confirm_link = function(f) {
    if (/recc/.test(f.name)) {
        var d = f.name.split("-");
        var e = $(f).attr("href").split("/");
        var b = e[0] != "http:" ? e[2] : e[4];
        var c = "/j/rec_comment";
        $(f).click(function() {
            var g = confirm("真的要删除?");
            if (g) {
                $.getJSON(c, {rid: d[1],del_comment: d[2]}, function() {
                    $(f).parent().parent().parent().remove()
                })
            }
            return false
        })
    } else {
        if (/sayc/.test(f.name)) {
            var d = f.name.split("-");
            var e = $(f).attr("href").split("/");
            var b = e[0] != "http:" ? e[2] : e[4];
            var c = "/j/saying_comment";
            $(f).click(function() {
                var g = confirm("真的要删除?");
                if (g) {
                    $.getJSON(c, {sid: d[1],del_comment: d[2]}, function() {
                        $(f).parent().parent().parent().remove()
                    })
                }
                return false
            })
        } else {
            var f = $(f);
            f.click(function() {
                var g = f.attr("title") || f.text();
                g = (g.slice(0, 1) == "!") ? g.slice(1) : "真的要" + g + "?";
                return confirm(g)
            })
        }
    }
};
var populate_tag_btns = function(g, h, b, e) {
    if (b.length) {
        var c = $("<dl><dt>" + g + "</dt></dl>"), f = $("<dd></dd>");
        $.each(b, function(k, d) {
            var j = $('<span class="tagbtn"></span>').addClass(e[d.toLowerCase()] ? "rdact" : "gract").text(d);
            f.append(j).append(" &nbsp; ")
        });
        c.append(f);
        h.append(c)
    }
};
Douban.init_music_sync_form = function(c) {
    var e = $("form.music-sns"), d = $("form.show_sync");
    if (e.length && d.length) {
        $("#overlay, #dialog").hide();
        var b = dui.Dialog({title: "授权同步信息至豆瓣说与第三方网站",url: "/settings/pop",autoupdate: true,callback: function(f, g) {
                $("a#btn-later", g.node).bind("click", function() {
                    $("div.dui-dialog").remove();
                    $("#overlay, #dialog").show();
                    return false
                });
                $("a#btn-never", g.node).bind("click", function(h) {
                    h.preventDefault();
                    $.post_withck("/settings/never_pop_sync_settings", {}, function() {
                        $("div.dui-dialog").remove();
                        $("#overlay, #dialog").show()
                    });
                    return false
                });
                $("a.dui-dialog-close", g.node).bind("click", function() {
                    $("div.dui-dialog").remove();
                    $("#overlay, #dialog").show();
                    return false
                })
            }});
        b.open();
        $("a#btn-auth").live("click", function() {
            $.post_withck("/settings/pop_sync", {}, function(g) {
                var f = b.node;
                if (f.find(".bd").find("#pop-sync").length == 0) {
                    f.find(".bd").append(g);
                    b.update()
                }
            })
        })
    }
};
Douban.init_interest_form = function(b) {
    Douban.init_music_sync_form(b);
    var k = $(b), d = {}, e = {}, h = $(".share-label", b);
    $("body").data("shuo-conf", true);
    $("body").data("sina-conf", true);
    $("body").data("tencent-conf", true);
    if (k.data("bind") === "true") {
        return
    } else {
        k.data("bind", "true")
    }
    var j = function(n) {
        if (d[n]) {
            e[n] = true;
            $.each(d[n], function(p, o) {
                $(o).removeClass("gract").addClass("rdact")
            })
        }
    };
    var g = function(n) {
        if (d[n]) {
            delete e[n];
            $.each(d[n], function(p, o) {
                $(o).removeClass("rdact").addClass("gract")
            })
        }
    };
    var c = function() {
        var n = $.trim(b.tags.value.toLowerCase()).split(" "), o = {};
        $.each(n, function(q, p) {
            if (p != "") {
                j(p);
                o[p] = true
            }
        });
        for (t in e) {
            if (!o[t]) {
                g(t)
            }
        }
    };
    var l = function() {
        var o = $("#inp-private"), s = $(".share-shuo"), p = $(".share-sina"), q = $(".share-tencent"), r = o.attr("checked");
        var n = function(x, u, v) {
            var w = $("input", u);
            if (x == true) {
                w.attr("checked", false);
                w.attr("disabled", "disabled");
                u.addClass("greyinput")
            } else {
                w.removeAttr("disabled");
                u.removeClass("greyinput");
                w.attr("checked", $("body").data(v))
            }
        };
        n(r, s, "shuo-conf");
        n(r, p, "sina-conf");
        n(r, q, "tencent-conf")
    };
    var f = function(p) {
        var o = p.data.key, n = $("body").data(o);
        if (n == true) {
            n = false
        } else {
            n = true
        }
        $("body").data(o, n)
    };
    c();
    if ($(b).data("comment")) {
        b.comment.focus()
    } else {
        if ($("#foldcollect").val() == "U") {
            b.tags.focus()
        }
    }
    $(b).submit(function() {
        var n = $(this).attr("action").split("/")[3];
        remote_submit_json(this, function(q) {
            var r = $("#dialog .shuo :input[type=checkbox]"), o = $("div#dialog form.movie-sns");
            book = $("div#dialog form.book-sns");
            if (q.r != 0) {
                $("#saving").remove();
                $("#submits").show();
                $("#error").html(Douban.errdetail[q.r]);
                refine_dialog();
                return
            }
            $("#collect_form_" + n).html("");
            if (r.length && r[0].checked) {
                close_dialog();
                if (typeof DoubanShare !== "undefined") {
                    DoubanShare.share(q);
                    DoubanShare.onDialogClose(function() {
                        self.location.replace(self.location.href)
                    })
                }
                return
            } else {
                if (o.length && q.pop_sync) {
                    close_dialog();
                    var p = dui.Dialog({title: "授权同步信息至豆瓣说与第三方网站",url: "/settings/pop",autoupdate: true,callback: function(s, u) {
                            $("a#btn-later", u.node).bind("click", function() {
                                $("div.dui-dialog").remove();
                                self.location.replace(self.location.href);
                                return false
                            });
                            $("a#btn-never", u.node).bind("click", function(v) {
                                v.preventDefault();
                                $.post_withck("/settings/never_pop_sync_settings", {}, function() {
                                    $("div.dui-dialog").remove();
                                    self.location.replace(self.location.href)
                                });
                                return false
                            });
                            $("a.dui-dialog-close", u.node).bind("click", function() {
                                self.location.replace(self.location.href);
                                return false
                            })
                        }});
                    p.open()
                } else {
                    if (book.length && q.book_pop_sync) {
                        close_dialog();
                        var p = dui.Dialog({title: "授权同步信息至豆瓣说与第三方网站",url: "/settings/pop",autoupdate: true,callback: function(s, u) {
                                $("a#btn-later", u.node).bind("click", function() {
                                    $("div.dui-dialog").remove();
                                    self.location.replace(self.location.href);
                                    return false
                                });
                                $("a#btn-never", u.node).bind("click", function(v) {
                                    v.preventDefault();
                                    $.post_withck("/settings/never_pop_sync_settings", {}, function() {
                                        $("div.dui-dialog").remove();
                                        self.location.replace(self.location.href)
                                    });
                                    return false
                                });
                                $("a.dui-dialog-close", u.node).bind("click", function() {
                                    self.location.replace(self.location.href);
                                    return false
                                })
                            }});
                        p.open()
                    }
                }
            }
            if ($(b).data("reload")) {
                if (/subject\/\d+\/comments/.test(location.href)) {
                    location.href = location.href.split("?sort")[0] + "?sort=time"
                } else {
                    if (/people\/[^\/]+\/(edittag|all|do|wish|collect)/.test(location.href)) {
                        location.href = location.href
                    } else {
                        location.href = location.href.split("?")[0]
                    }
                }
            } else {
                close_dialog()
            }
        }, false);
        $("#submits").hide().after('<div id="saving" class="m">正在保存...</div>');
        refine_dialog();
        return false
    });
    if (h) {
        $("#inp-private").click(l);
        $("input[name=share-shuo]").bind("click", {key: "shuo-conf"}, f);
        $("input[name=share-sina]").bind("click", {key: "sina-conf"}, f);
        $("input[name=share-tencent]").bind("click", {key: "tencent-conf"}, f)
    }
    $(b.cancel).click(function() {
        var n = $(b).attr("action").split("/")[3];
        $("#collect_form_" + n).html("")
    });
    $(".tagbtn", b).each(function(o) {
        var n = $(this).text().toLowerCase();
        if (d[n]) {
            d[n].push(this)
        } else {
            d[n] = [this]
        }
    }).click(function() {
        var n = $(this).text();
        var p = $.trim(b.tags.value).split(" "), s = false, o = n.toLowerCase(), q;
        p = $.grep(p, function(v, u) {
            if (v.toLowerCase() == o) {
                g(o);
                s = true;
                return false
            } else {
                return true
            }
        });
        if (!s) {
            p.push(n);
            j(o)
        }
        var r = p.join(" ");
        b.tags.value = (r.length > 1) ? r + " " : r;
        b.tags.focus()
    });
    $(b.tags).keyup(c)
};
Douban.init_stars = function(e) {
    var b = {1: "很差",2: "较差",3: "还行",4: "推荐",5: "力荐"}, g = $("#n_rating", e), c = $("#stars img", e), d = function(f) {
        var h = g.val() || 0;
        c.each(function(l) {
            var k = this.src.replace(/\w*\.gif$/, ((l < f) ? "sth" : ((l < h) ? "st" : "nst")) + ".gif");
            this.src = k
        });
        if (f) {
            $("#rateword", e).text(b[f])
        } else {
            $("#rateword", e).text(h ? b[h] : "")
        }
    };
    c.hover(function() {
        d(this.id.charAt(4))
    }, function() {
        d(0)
    });
    if (g.attr("name")) {
        c.click(function() {
            var f = this.id.charAt(4);
            g.val(f);
            d(f)
        })
    }
    d()
};
Douban.init_tries_to_listen = function(c) {
    var b = $(c).attr("name");
    $(c).click(function() {
        var k = !document.all;
        if (b != "") {
            var e = b.split("-");
            var d = e[0];
            var f = e[1]
        } else {
            var d = 384;
            var f = 450
        }
        var j = (screen.width - d) / 2;
        var g = k ? (screen.height - f) / 2 : 50;
        window.open($(c).attr("href"), "", "width=" + d + ",height=" + f + ",top=" + g + ",left=" + j + ",scrollbars=0,resizable=0,status=1");
        return false
    })
};
Douban.init_discover = function(c) {
    var b = $("#discover_text")[0];
    $(c).submit(function(e) {
        if (!b.value || b.value == b.title) {
            return false
        }
        var d = "";
        d = $(":radio:checked")[0].value;
        if (d == "event") {
            $("#discover_s").attr("action", "/event/search")
        } else {
            if (d == "group") {
                $("#discover_s").attr("action", "/group/search?q=" + $("#discover_text").value)
            } else {
                $("#discover_s").attr("action", "/subject_search")
            }
        }
    });
    $(c, ":radio").click(function() {
        b.focus()
    })
};
var friend_form_update = function(c, b) {
    $("#divac").html(c);
    $("#submitac").submit(function() {
        this.action = "/j/people/" + b + "/friend";
        remote_submit_json(this, function(d) {
            $("#divac").parent().html(d.html);
            $("#tip_wait").yellow_fade();
            load_event_monitor($(c))
        });
        return false
    });
    $("#cancelac").click(function() {
        $("#divac").html("")
    })
};
Douban.init_review_full = function(e) {
    var c = $(e).attr("id").split("_");
    var d = c[1];
    var b = c[2];
    $(".link", e).click(function() {
        var f = "/j/review/" + d + "/" + b;
        $.getJSON(f, function(g) {
            $(e).html(g.html);
            load_event_monitor($(e))
        });
        return false
    })
};
Douban.init_show_login = function(b) {
    $(b).click(function() {
        return pop_win.load("/j/misc/login_form")
    })
};
Douban.init_show_signup_table = function(b) {
    $(b).click(function() {
        event_id = window.location.href.split("/")[4];
        return pop_win.load("/j/event/" + event_id + "/signup")
    })
};
var set_cookie = function(h, g, e, f) {
    var c = new Date();
    c.setTime(c.getTime() + ((g || 30) * 24 * 60 * 60 * 1000));
    var b = "; expires=" + c.toGMTString();
    for (var d in h) {
        document.cookie = d + "=" + h[d] + b + "; domain=" + (e || "douban.com") + "; path=" + (f || "/")
    }
};
function get_cookie(d) {
    var f = d + "=";
    var b = document.cookie.split(";");
    for (var e = 0; e < b.length; e++) {
        var g = b[e];
        while (g.charAt(0) == " ") {
            g = g.substring(1, g.length)
        }
        if (g.indexOf(f) == 0) {
            return g.substring(f.length, g.length).replace(/\"/g, "")
        }
    }
    return null
}
Douban.init_hideme = function(b) {
    $(b).click(function() {
        $(this).parent().parent().parent().hide()
    })
};
Douban.init_more = function(b) {
    $(b).click(function() {
        lastObj = $(this).prev().find("input");
        ids = /(.*_)(\d+)$/.exec(lastObj.attr("id"));
        id = ids[1] + (parseInt(ids[2]) + 1);
        a = lastObj.clone();
        a.attr("value", "");
        $(this).before("<br/>").before(a);
        a.attr("id", id).attr("name", id).wrap("<span></span>")
    })
};
Douban.init_more2 = function(b) {
    $(b).click(function() {
        lastObj = $(this).prev().find("input");
        ids = /(.*_)(\d+)_(\d+)$/.exec(lastObj.attr("id"));
        last_id = parseInt(ids[3]);
        nid = last_id + 1;
        id = ids[1] + parseInt(ids[2]) + "_" + nid;
        a = lastObj.clone();
        a.attr("value", "");
        $(this).before('<br/><span class="pl idx">' + (nid + 1) + "</span>").before(a);
        a.attr("id", id).attr("name", id).removeClass("m").wrap("<span></span>");
        init_keyup();
        list_data[id] = "无"
    })
};
Douban.init_search_text = function(b) {
    if (!b.value || b.value == b.title) {
        $(b).addClass("greyinput");
        b.value = b.title
    }
    $(b).focus(function() {
        $(b).removeClass("greyinput");
        if (b.value == b.title) {
            b.value = ""
        }
    });
    $(b).blur(function() {
        if (!b.value) {
            $(b).addClass("greyinput");
            b.value = b.title
        }
    })
};
Douban.init_checkreg = function(b) {
    $(b).find(".butt").click(function() {
        var c = true;
        $(b).find("input").each(function() {
            if (this.type != "submit" && this.type != "button") {
                if (this.value == "") {
                    $(this).next().css("display", "inline");
                    c = false
                } else {
                    $(this).next().css("display", "none")
                }
            }
        });
        return c
    })
};
Douban.init_click_tip = function(c) {
    var b = $(c).parent().find(".blocktip");
    $(c).click(function() {
        b.show().blur_hide();
        m = b.width() + b.pos().x - $.viewport_size()[0] > 0 ? -b.width() : 0;
        b.css("margin-left", m)
    });
    $(".hideme", b).click(function() {
        b.hide()
    })
};
function clean_tip() {
    var b = $("#page_focus")[0];
    return b && b.value != b.title
}
Douban.init_submit_link = function(b) {
    $(b).click(function() {
        $(b).parent().submit()
    })
};
var nowmenu = null;
var hidemenu = function(b) {
    b.find(".down").css("display", "inline");
    b.find(".up").hide();
    b.next().hide();
    nowmenu = null;
    $("body").unbind("mousedown")
};
var openmenu = function(b) {
    if (nowmenu != null) {
        hidemenu(nowmenu)
    }
    b.find(".up").css("display", "inline");
    b.find(".down").hide();
    b.next().show();
    nowmenu = b;
    $("body").mousedown(function() {
        if (b.parent().attr("rel") != "on") {
            hidemenu(b)
        }
    })
};
$(function() {
    $("a", "#dsearch").each(function() {
        $(this).click(function() {
            if (!clean_tip()) {
                return true
            }
            urls = $(this).attr("href").split("?cat=");
            $("#ssform").attr("action", urls[0]);
            if (urls[1] != undefined) {
                $('<input type="hidden" name="cat" value="' + urls[1] + '" />').appendTo($("#ssform"))
            }
            $("#ssform").submit();
            return false
        })
    });
    $(".arrow").click(function() {
        if ($(this).find(".up").is(":hidden")) {
            openmenu($(this))
        } else {
            hidemenu($(this))
        }
        this.blur()
    });
    $(".arrow").parent().hover(function() {
        $(this).attr("rel", "on")
    }, function() {
        $(this).attr("rel", "off")
    });
    if ($.suggest) {
        $("#page_focus").suggest("/j/subject_suggest", {onSelect: function() {
                $(this).parents("form").append('<span><input name="add" value="1" type="hidden"/></span>').submit()
            }})
    }
    var b = get_cookie("report");
    if (b) {
        set_cookie({report: ""}, 0);
        $.get("/stat.html?" + b)
    }
    $(":submit").each(function() {
        if ($(this).val() == "加上去") {
            $(this).click(function() {
                var c = this;
                setTimeout(function() {
                    c.disabled = 1
                }, 0)
            })
        }
    });
    if ($.browser.msie && $.browser.version == "6.0") {
        $("form.miniform > :submit").hover(function() {
            $(this).addClass("hover")
        }, function() {
            $(this).removeClass("hover")
        })
    }
});
var show_dialog = function(c, b) {
    if ($("#dialog").length) {
        return
    }
    $("body").prepend('<div id="overlay"></div><div id="dialog" style="width:' + (b || 550) + 'px;"></div>');
    if (c != null) {
        $("#dialog").html(c)
    } else {
        $("#dialog").html("<div class='loadpop'>正在载入，请稍候...</div>")
    }
    set_overlay()
};
var set_overlay = function() {
    var d = ($.browser.msie ? -2 : 16), c = $("#dialog")[0], b = c.offsetWidth, e = (document.body.offsetWidth - b) / 2;
    $("#overlay").css({height: c.offsetHeight + d,width: b + 16,left: e + 5 + "px"});
    c.style.left = e + "px"
};
var close_dialog = function() {
    $("#overlay").unbind("click");
    $("#dialog,#overlay,.bgi").remove();
    if (typeof document.body.style.maxHeight == "undefined") {
        $("body", "html").css({height: "auto",width: "auto"});
        $("html").css("overflow", "")
    }
    document.onkeydown = "";
    return false
};
var refine_dialog = function() {
    if (!$("#dialog").length) {
        return
    }
    var b = navigator.userAgent.toLowerCase();
    var c = 0.5 * ($.viewport_size()[1] - $("#dialog")[0].offsetHeight) + 140;
    $("#dialog,#overlay").css("top", c);
    set_overlay()
};
Douban.init_show_full = function(b) {
    $(b).click(function() {
        $(b).parents(".short").hide();
        $(b).parents(".short").next().show()
    })
};
Douban.init_show_full2 = function(b) {
    $(b).click(function() {
        $(b).parents(".short").hide();
        $(b).parents(".short").next().show();
        $(b).parents(".reading-note").nextAll(".col-rec-con").show();
        $(b).parents(".reading-note").next().children(".no-comments").show()
    })
};
Douban.init_show_short = function(b) {
    $(b).click(function() {
        $(b).parents(".all").hide();
        $(b).parents(".all").prev().show()
    })
};
Douban.init_show_short2 = function(b) {
    $(b).click(function() {
        $(b).parents(".all").hide();
        $(b).parents(".all").prev().show();
        $(b).parents(".reading-note").nextAll(".col-rec-con").hide();
        $(b).parents(".reading-note").next().children(".no-comments").hide()
    })
};
Douban.init_show_more = function(b) {
    $(b).click(function() {
        $(b).parent().prevAll(".more").show();
        $(b).parent().remove()
    })
};
Douban.init_collect_btn = function(b) {
    $(b).click(function(h) {
        h.preventDefault();
        if ($("#hiddendialog").length) {
            show_dialog($("#hiddendialog").html());
            load_event_monitor($("#dialog"));
            return
        }
        show_dialog(null);
        var f = $(this).attr("name").split("-"), j = f[0], c = f[1], k = f[2], g = f[3], d = "/j/subject/" + c + "/interest?" + (k ? "interest=" + k : "") + (g ? "&rating=" + g : "") + (j == "cbtn" ? "&cmt=1" : "");
        $.getJSON(d, function(e) {
            if (!$("#dialog").length) {
                return
            }
            var o = $("<div></div>");
            o.get(0).innerHTML = e.html;
            var w = e.tags;
            var s = w.join(" ");
            $("input[name=tags]", o).val((s.length > 1) ? s + " " : s);
            var n = {};
            $.each(w, function(x, r) {
                n[r.toLowerCase()] = true
            });
            populate_tag_btns("我的标签:", $("#mytags", o), e.my_tags, n);
            populate_tag_btns("常用标签:", $("#populartags", o), e.popular_tags, n);
            if (j == "pbtn" || j == "cbtn") {
                $("form", o).data("reload", 1)
            }
            $("#dialog").html(o);
            $("#showtags").click(function() {
                if ($("#advtags").is(":hidden")) {
                    $(this).html("缩起 ▲");
                    $("#advtags").show();
                    $("#foldcollect").val("U")
                } else {
                    $(this).html($(this).attr("rel"));
                    $("#advtags").hide();
                    $("#foldcollect").val("F")
                }
                $(this).blur();
                refine_dialog()
            });
            var l = $("input[name=interest]", o), u = $(".rate_stars"), q = function() {
                if (l[0].checked) {
                    u.hide()
                } else {
                    u.show()
                }
                refine_dialog()
            };
            l.click(q);
            q();
            if ($("#left_n").length) {
                var p = $("#left_n").text();
                llen = (p.match(/\d+/i) == p) ? p : 140;
                $("#comment").display_limit(llen, $("#left_n"))
            }
            if (j == "cbtn") {
                var v = $("h2", "#dialog");
                v.text(v.text().replace("修改", "写短评"));
                if (!l[0].checked && l[1]) {
                    l[1].checked = true
                }
                $("form", "#dialog").data("comment", 1)
            }
            load_event_monitor(o);
            $.fn.movieDisplayLimit = function(x, A, r) {
                function y(C, D, B) {
                    D.text(B - Math.ceil(C.val().replace(/[^\x00-\xff]/g, "**").length / 2))
                }
                function z(D) {
                    var E = D.val().match(/[^\x00-\xff]/ig), B = !E ? 0 : E.length, C = D.val().length - B;
                    x.attr("maxlength", 140 + Math.ceil(C / 2))
                }
                y(x, A, r);
                $(this).keyup(function() {
                    y($(this), A, r);
                    z($(this));
                    return false
                })
            };
            if ($("div#dialog form.movie-sns").length) {
                $("textarea#comment").unbind().movieDisplayLimit($("textarea#comment"), $("span#left_n"), 140)
            }
        });
        return false
    })
};
Douban.init_nine_collect_btn = function(b) {
    $(b).click(function() {
        var e = $(this).attr("name").split("-");
        var f = e[0], c = e[1], g = e[2];
        var d = "/j/subject/" + c + "/interest";
        $.getJSON(d, g && {interest: g}, function(l) {
            var j = $("<div></div>").html(l.html);
            var h = l.tags;
            var k = h.join(" ");
            $("input[name=tags]", j).val((k.length > 1) ? k + " " : k);
            var n = {};
            $.each(h, function(p, o) {
                n[o.toLowerCase()] = true
            });
            populate_tag_btns("我的标签(点击添加):", $("#mytags", j), l.my_tags, n);
            populate_tag_btns("豆瓣成员常用的标签(点击添加):", $("#populartags", j), l.popular_tags, n);
            if (f == "pbtn") {
                $("form", j).data("reload", 1)
            }
            $("#collect_form_" + c).html("").append('<p class="ul"></p>').append(j);
            load_event_monitor($("#collect_form_" + c))
        });
        return false
    })
};
Douban.init_rec_btn = function(g) {
    var c = $(g).attr("name").split("-"), b = "/j/recommend", e = "rdialog-" + c[1] + "-" + c[2], d = function() {
        var h = ((c[1] == "I") && (c[2] == undefined)) ? $("input", $(g).parent())[0].value : c[2], j = (c[3] == undefined) ? "" : c[3], f = function(l) {
            if (l == "I") {
                var k = $(".text", "#dialog");
                if (k.length) {
                    if (k[0].value.length) {
                        k[1].focus()
                    } else {
                        k[0].focus()
                    }
                }
            } else {
                $("#dialog").find(":submit").focus()
            }
            if ($(g).hasClass("novote")) {
                $("form", "#dialog").append('<input name="novote" value="1" type="hidden"/>')
            }
        };
        if ($("#" + e).length) {
            show_dialog($("#" + e).html());
            load_event_monitor("#dialog");
            f(c[1])
        } else {
            $.getJSON(b, {type: c[1],uid: h,rec: j}, function(k) {
                show_dialog(k.html);
                if (c[1] != "I") {
                    var l = $('<div id="' + e + '"></div>');
                    l.html(k.html).appendTo("body").hide()
                }
                load_event_monitor("#dialog");
                f(c[1])
            })
        }
        return false
    };
    $(g).click(d);
    if (c[1] == "I") {
        $(g).parent().parent().submit(d)
    }
};
Douban.init_rec_form = function(b) {
    var c = $(b);
    c.submit(function(d) {
        $(":submit,:input", this).attr("disabled", true);
        $("#ban_word").remove();
        remote_submit_json(this, function(e) {
            trace(e);
            if (e.ban) {
                $(":submit,:input", b).attr("disabled", false);
                $(".recsubmit").before('<div class="attn" style="text-align:center" id="ban_word">你的推荐中有被禁止的内容</div >');
                return
            }
            $("#dialog").html('<div class="loadpop m">推荐已提交</div>');
            set_overlay();
            $("#rec_url_text").attr("value", "http://");
            setTimeout(function() {
                $("#dialog, #overlay").fadeOut(close_dialog);
                if ($("input[name=type]", b).val() == "I") {
                    document.location.reload()
                }
            }, 400)
        });
        return false
    });
    c.find(".reccomment label").click(function(d) {
        $(this).next().focus()
    });
    c.find(".reccomment .text").focus(function(d) {
        $(this).prev().hide()
    }).blur(function(f) {
        var d = $(this);
        if ($.trim(d.val()) === "") {
            $(this).prev().show()
        }
    });
    c.set_len_limit(140)
};
Douban.init_saying_reply = function(d) {
    var c = d.name.split("-");
    var b = "/j/saying_comment";
    if (!d.rev) {
        $(d).attr("rev", "unfold")
    }
    $(d).click(function() {
        if (d.rev != "unfold") {
            $(d).parent().parent().next().remove();
            $(d).html($(d).attr("rev"));
            d.rev = "unfold"
        } else {
            if (d.rel != "polling") {
                d.rel = "polling";
                $.getJSON(b, {sid: c[2],type: c[3],n: c[4],ni: c[5]}, function(e) {
                    $('<div class="recreplylst"></div>').insertAfter($(d).parent().parent()).html(e.html);
                    load_event_monitor($(d).parent().parent().next());
                    $(d).attr("rev", $(d).html()).text("隐藏回应");
                    d.rel = ""
                })
            }
        }
        return false
    })
};
Douban.init_rec_reply = function(d) {
    var c = d.name.split("-");
    var b = "/j/rec_comment";
    if (!d.rev) {
        $(d).attr("rev", "unfold")
    }
    $(d).click(function() {
        if (d.rev != "unfold") {
            $(d).parent().parent().next().remove();
            $(d).html($(d).attr("rev"));
            d.rev = "unfold"
        } else {
            if (d.rel != "polling") {
                d.rel = "polling";
                $.getJSON(b, {rid: c[2],type: c[3],n: c[4],ni: c[5]}, function(e) {
                    $('<div class="recreplylst"></div>').insertAfter($(d).parent().parent()).html(e.html);
                    load_event_monitor($(d).parent().parent().next());
                    $(d).attr("rev", $(d).html()).text("隐藏回应");
                    d.rel = ""
                })
            }
        }
        return false
    })
};
Douban.init_reply_form = function(b) {
    $(b).attr("action", $(b).attr("rev"));
    var c = $(b).attr("name");
    $(b).submit(function() {
        remote_submit_json(this, function(f) {
            var e = $(b).parent();
            $(e).html(f.html);
            load_event_monitor(e);
            if (c == "n") {
                var d = $('<span><a href="javascript:void(0)">添加回应</a></span>')
            } else {
                var d = $('<span style="margin-left:53px"><a href="javascript:void(0)">添加回应</a></span>')
            }
            $("form", e).hide().after(d);
            d.click(function() {
                $(this).prev().show();
                $(this).remove()
            })
        });
        $(":submit", b).attr("disabled", 1);
        return false
    });
    $(b).set_len_limit(140)
};
Douban.init_video_comment = function(b) {
    $(b).submit(function() {
        remote_submit_json(this, function(d) {
            var c = $("#comments");
            $(c).html(d.html);
            load_event_monitor(c);
            $(":submit", b).attr("disabled", 0);
            $("textarea", b).attr("disabled", 0);
            $("textarea", b).attr("value", "")
        }, true, "/j/video/add_comment");
        return false
    })
};
Douban.init_video_del_comment = function(c) {
    var b = $(c).attr("name").split("-");
    $(c).click(function() {
        var d = c.title;
        if (confirm("真的要" + d + "?") == true) {
            $.postJSON_withck("/j/video/del_comment", {comment_id: b[1],video_id: b[2]}, function(f) {
                var e = $("#c-" + b[1]);
                $(e).html("")
            })
        }
        return false
    })
};
Douban.init_noti_form = function(b) {
    $(":submit", b).click(function() {
        $(this).addClass("selected")
    });
    $(b).attr("action", "/j/request/");
    $(b).submit(function() {
        b.confirm.disabled = true;
        b.ignore.disabled = true;
        remote_submit_json(this, function(c) {
            $(b).parent().html(c.html)
        });
        return false
    })
};
Douban.init_editable = function(f) {
    var d = $("#display", f), e = $("form", f)[0], c = $("a", "#edi");
    var b = function(g) {
        if (g != undefined) {
            d.text(g);
            if (d.text() == "") {
                c.text("点击添加描述").addClass("sign-text")
            } else {
                c.text("修改").removeClass("sign-text")
            }
        }
        d.show();
        $(e).hide();
        $("#edi").show()
    };
    b(d.text());
    if (e.name) {
        $(e).set_len_limit(e.name)
    }
    $(e).submit(function() {
        remote_submit_json(e, function(g) {
            b(g.desc)
        });
        $("textarea", e)[0].value = "正在保存...";
        return false
    });
    $(".cancel", e).click(function() {
        b()
    });
    $("#edi", f).click(function() {
        $("#display,#edi").hide();
        $("input,textarea", "form").attr("disabled", 0);
        $("textarea", f)[0].value = d.text();
        $(e).show();
        $("textarea", f).focus();
        return false
    })
};
Douban.init_show_video = function(c) {
    $(c).css("position", "relative").attr("target", "");
    $(".vthumbwrap", c).append('<div class="video_overlay"></div>');
    var b = $("img", c).attr("name");
    $(c).click(function(f) {
        f.preventDefault();
        var d = $('<a href="#">缩进</a>');
        d.click(function(g) {
            g.preventDefault();
            $(c).show();
            $(this).prev().remove();
            $(this).remove()
        });
        $(c).after(d).after("<em>" + b + "</em>");
        $(c).hide()
    })
};
Douban.init_morerec = function(b) {
    $(b).click(function() {
        var c = $(b).parent().next();
        if (c.is(":hidden")) {
            c.show()
        } else {
            c.next().show()
        }
        $(b).remove()
    })
};
Douban.init_search_result = function(b) {
    $("#sinput").suggest("/j/subject_suggest", {resultsClass: "rc_results",onSelect: function() {
            $(b).parent().submit()
        }});
    $(b).parent().submit(function() {
        var c = $("#sinput")[0];
        return c && c.value != c.title
    });
    Douban.init_search_text(b)
};
Douban.init_prompt_link = function(b) {
    $(b).click(function() {
        var c = prompt(b.title || "请输入");
        if (c) {
            location.href = b.href + (b.href.indexOf("?") == -1 ? "?" : "&") + b.name + "=" + encodeURIComponent(c)
        }
        return false
    })
};
Douban.init_discard_notify = function(o) {
    $(o).click(function() {
        var url = "/j/notification/discard";
        var n_id = o.name;
        if (confirm("不再提醒该内容的新回复?")) {
            $.post_withck(url, {id: n_id}, function(ret) {
                var r = eval("(" + ret + ")");
                if (r.r === "Y") {
                    $("#n-" + n_id).remove()
                }
            })
        }
        return false
    })
};
$.viewport_size = function() {
    var b = [0, 0];
    if (typeof window.innerWidth != "undefined") {
        b = [window.innerWidth, window.innerHeight]
    } else {
        if (typeof document.documentElement != "undefined" && typeof document.documentElement.clientWidth != "undefined" && document.documentElement.clientWidth != 0) {
            b = [document.documentElement.clientWidth, document.documentElement.clientHeight]
        } else {
            b = [document.body.clientWidth, document.body.clientHeight]
        }
    }
    return b
};
$.ajax_withck = function(b) {
    if (b.type == "POST") {
        b.data = $.extend(b.data || {}, {ck: get_cookie("ck")})
    }
    return $.ajax(b)
};
$.postJSON_withck = function(b, c, d) {
    $.post_withck(b, c, d, "json")
};
$.post_withck = function(b, d, e, c) {
    if ($.isFunction(d)) {
        c = e;
        e = d;
        d = {}
    }
    return $.ajax({type: "POST",url: b,data: $.extend(d, {ck: get_cookie("ck")}),success: e,dataType: c || "text"})
};
(function() {
    var b = {};
    $.tmpl = function(e, d) {
        var c = b[e] = b[e] || new Function("obj", "var p=[];with(obj){p.push('" + e.replace(/[\r\t\n]/g, " ").replace(/'(?=[^%]*%})/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/{%=(.+?)%}/g, "',$1,'").split("{%").join("');").split("%}").join("p.push('") + "');}return p.join('');");
        return c(d)
    }
})();
String.prototype.escapeHTML = function() {
    return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
};
jQuery.fn.extend({pos: function() {
        var c = this[0];
        if (c.offsetParent) {
            for (var d = 0, b = 0; c.offsetParent; c = c.offsetParent) {
                d += c.offsetLeft;
                b += c.offsetTop
            }
            return {x: d,y: b}
        } else {
            return {x: c.x,y: c.y}
        }
    },chop: function(g, b) {
        var d = [], c = [];
        for (var e = 0, f = this.length; e < f; e++) {
            if (!b != !g(this[e], e)) {
                d.push(this[e])
            } else {
                c.push(this[e])
            }
        }
        return [d, c]
    },sum: function(c, e) {
        var b = this.length, d = zero = e ? "" : 0;
        while (b) {
            d += this[--b][c] + (b && e || zero)
        }
        return d
    },set_len_limit: function(c) {
        var d = this.find(":submit:first");
        var e = d.attr("value");
        var b = function() {
            if (this.value && this.value.length > c) {
                d.attr("disabled", 1).attr("value", "字数不能超过" + c + "字")
            } else {
                d.attr("disabled", 0).attr("value", e)
            }
        };
        $("textarea", this).focus(b).blur(b).keydown(b).keyup(b)
    },display_limit: function(b, g) {
        var c = this, e, d = function(h) {
            var f = c.val();
            if (f == e) {
                return
            }
            if (f.length >= b) {
                c.val(f.substring(0, b))
            }
            g.text(b - c.val().length);
            e = c.val()
        };
        this.keyup(d);
        d()
    },set_caret: function() {
        if (!$.browser.msie) {
            return
        }
        var b = function() {
            this.p = document.selection.createRange().duplicate()
        };
        this.click(b).select(b).keyup(b)
    },insert_caret: function(c) {
        var k = this[0];
        if (document.all && k.createTextRange && k.p) {
            var j = k.p;
            j.text = j.text.charAt(j.text.length - 1) == "" ? c + "" : c
        } else {
            if (k.setSelectionRange) {
                var f = k.selectionStart;
                var h = k.selectionEnd;
                var g = k.value.substring(0, f);
                var d = k.value.substring(h);
                k.value = g + c + d;
                k.focus();
                var b = c.length;
                k.setSelectionRange(f + b, f + b);
                k.blur()
            } else {
                k.value += c
            }
        }
    },get_sel: function() {
        var b = this[0];
        return document.all && b.createTextRange && b.p ? b.p.text : b.setSelectionRange ? b.value.substring(b.selectionStart, b.selectionEnd) : ""
    },blur_hide: function() {
        var c = this, b = function() {
            return false
        };
        c.mousedown(b);
        $(document.body).mousedown(function() {
            c.hide().unbind("mousedown", b);
            $(document.body).unbind("mousedown", arguments.callee)
        });
        return this
    },yellow_fade: function() {
        var b = 0, d = 1, c = this;
        function e() {
            c.css({backgroundColor: "rgb(100%,100%," + b + "%)"});
            b += d;
            d += 0.5;
            if (b <= 100) {
                setTimeout(e, 35)
            } else {
                c.css({backgroundColor: ""})
            }
        }
        e();
        return this
    },hover_fold: function(d) {
        var b = {folder: [1, 3],unfolder: [0, 2]}, c = function(e, f) {
            return function() {
                $("img", e).attr("src", "/pics/arrow" + f + ".gif")
            }
        };
        return this.hover(c(this, b[d][0]), c(this, b[d][1]))
    },multiselect: function(d) {
        var g = function() {
            return true
        }, f = d.onselect || g, e = d.onremove || g, c = d.onchange || g, h = d.selclass || "sel", b = d.values || [];
        return this.click(function() {
            var k = /id(\d*)/.exec(this.className)[1], j = $.inArray(k, b);
            if (j != -1) {
                if (!e(this)) {
                    return
                }
                b.splice(j, 1);
                $(this).removeClass(h)
            } else {
                if (!f(this)) {
                    return
                }
                b.push(k);
                $(this).addClass(h)
            }
            c(b);
            return false
        })
    },initDataInput: function() {
        var b = $(this);
        if (!b.val() || b.val() === b.attr("title")) {
            b.addClass("color-lightgray");
            b.val(b.attr("title"))
        }
        b.focus(function() {
            b.removeClass("color-lightgray");
            if (b.val() === b.attr("title")) {
                b.val("")
            }
        }).blur(function() {
            if (!b.val()) {
                b.addClass("color-lightgray");
                b.val(b.attr("title"))
            }
        })
    },setItemList: function(p) {
        var c = {}, g = "", n = '<img class="gray-loader" src="/pics/spinner.gif" />', e = "/pics/spinner.gif", j = ".input-create", l = {keyup: function(q) {
                var o = q.target.value.replace(/ /g, "");
                if (q.keyCode === 13) {
                    p.create.callback(c, g, o, p.limit)
                }
            }}, d = document.body, k = new Image(), f = {create: {title: "新分组",tips: "创建新分组"}}, p = $.extend(f, p), b = '<span class="create-new">' + p.create.title + "</span>", h = '<input class="input-create" type="text" value="" title="' + p.create.tips + '" maxlength="' + p.create.maxLen + '" />';
        k.src = e;
        $(this).click(function(o) {
            o.stopPropagation();
            c = this;
            sglist.hide();
            g = $.isFunction(p.target) ? p.target(c) : p.target;
            sgarrow.removeClass(CSS_ARROW_SELECT);
            $(c).addClass(CSS_ARROW_SELECT);
            $(CSS_SET_GROUP_LIST, this).show();
            $(j).focus();
            if ($.browser.msie && $.browser.version !== "8.0") {
                sgarrow.css("z-index", "");
                $(this).css("z-index", 10)
            }
        });
        $(CSS_SET_GROUP_LIST).delegate("li:not('.last')", "click", function(w) {
            w.preventDefault();
            var v = w.target, q = this, u = v.type === "checkbox" ? true : false, o = $(this).children("input"), s = $(this).children("input").val(), r = (u && o.attr("checked") || !u && !o.attr("checked")) ? "addtotag" : "removefromtag";
            if (!$(CSS_LOADER, this).length) {
                o.hide().after(n)
            }
            p.callback(q, r, u, g, s)
        });
        $(d).click(function(o) {
            $(CSS_SET_GROUP_LIST, this).hide();
            $(c).removeClass(CSS_ARROW_SELECT);
            if (newGroupNum && newGroupNum < p.limit) {
                $(j).replaceWith(b)
            }
        });
        $(CSS_SET_GROUP_LIST).delegate(".create-new", "click", function() {
            $(this).replaceWith(h);
            $(j).focus()
        });
        $(CSS_SET_GROUP_LIST).delegate(j, "keyup", function(o) {
            if ($.isFunction(l[o.type])) {
                l[o.type].call(this, o)
            }
        })
    }});
var check_form = function(b) {
    var c = true;
    $(":input", b).each(function() {
        if ((/notnull/.test(this.className) && this.value == "") || (/most/.test(this.className) && this.value && this.value.length > /most(\d*)/.exec(this.className)[1])) {
            $(this).next().show();
            c = false
        } else {
            if (/attn/.test($(this).next().attr("className"))) {
                $(this).next().hide()
            }
        }
    });
    return c
};
var paras = function(d) {
    var e = {};
    if (d.indexOf("?") == -1) {
        return {}
    }
    var f = d.split("?")[1].split("&");
    for (var c = 0; c < f.length; c++) {
        if (f[c].indexOf("=") != -1) {
            var b = f[c].split("=");
            e[b[0] + ""] = b[1] + ""
        }
    }
    return e
};
function delete_reply_notify(b) {
    if (!delete_reply_notify.id) {
        delete_reply_notify.id = b;
        show_dialog($("#confirm_delete").html(), 280);
        $("#overlay").css("z-index", 100);
        $("#dialog .submit").eq(0).focus()
    }
    return false
}
function close_delete(b) {
    if (b) {
        var c = delete_reply_notify.id;
        $.get("/j/accounts/remove_notify?id=" + c);
        $("#reply_notify_" + c).fadeOut()
    }
    delete_reply_notify.id = null;
    close_dialog()
}
function moreurl(b, e) {
    var d = ["ref=" + encodeURIComponent(location.pathname)];
    for (var c in e) {
        d.push(c + "=" + e[c])
    }
    set_cookie({report: d.join("&")}, 0.0001)
}
function tip_win(b) {
    $(b).next(".blocktip").show().blur_hide()
}
tip_win.hide = function(b) {
    $(b).parents(".blocktip").hide()
};
function js_parser(htm) {
    var tag = "script>", begin = "<" + tag, end = "</" + tag, pos = pos_pre = 0, result = script = "";
    while ((pos = htm.indexOf(begin, pos)) + 1) {
        result += htm.substring(pos_pre, pos);
        pos += 8;
        pos_pre = htm.indexOf(end, pos);
        if (pos_pre < 0) {
            break
        }
        script += htm.substring(pos, pos_pre) + ";";
        pos_pre += 9
    }
    result += htm.substring(pos_pre, htm.length);
    return {htm: result,js: function() {
            eval(script)
        }}
}
function center(b) {
    return {left: (document.documentElement.offsetWidth - b.offsetWidth) / 2 + "px",top: (document.documentElement.clientHeight - b.offsetHeight) * 0.45 + "px"}
}
function pop_win(f, e) {
    if (!window.__pop_win) {
        var h = document.createElement("div");
        h.className = "pop_win_bg";
        document.body.appendChild(h);
        var k = document.createElement("div");
        k.className = "pop_win";
        document.body.appendChild(k);
        __pop_win = {bg: h,body: k,body_j: $(k),bg_j: $(h)}
    }
    var c = __pop_win.body, d = __pop_win.body_j, j = js_parser(f);
    if (e !== true) {
        j.htm = '<a onclick="pop_win.close()" href="javascript:;" class="pop_win_close">X</a>' + j.htm
    }
    c.innerHTML = j.htm;
    var g = {left: (document.documentElement.offsetWidth - c.offsetWidth) / 2 + "px",top: (document.documentElement.clientHeight - c.offsetHeight) * 0.45 + "px"};
    if (document.documentElement.clientHeight < c.offsetHeight) {
        g.top = "0";
        g.height = document.documentElement.clientHeight - 40 + "px";
        g.overflow = "auto"
    }
    d.css({display: "block"}).css(g).css({visibility: "visible",zIndex: 9999});
    j.js();
    pop_win.fit();
    if (!window.XMLHttpRequest) {
        __pop_win.bg.style.top = ""
    }
}
pop_win.fit = function() {
    if (window.__pop_win) {
        var c = __pop_win.body;
        __pop_win.bg_j.css({height: c.offsetHeight + 16 + "px",width: c.offsetWidth + 16 + "px",left: c.offsetLeft - 8 + "px",top: c.offsetTop - 8 + "px",zIndex: 8888}).show()
    }
};
pop_win.close = function() {
    $(__pop_win.bg).remove();
    $(__pop_win.body).remove();
    window.__pop_win = null
};
pop_win.load = function(c, b) {
    pop_win('<div style="padding:20px 60px;">加载中, 请稍等...</div>');
    $.ajax({url: c,success: pop_win,cache: b || false,dataType: "html"});
    return false
};
function event_init_tab() {
    $("#tongcheng_tab").click(function() {
        if ($("#tongcheng_tab_block").is(":hidden")) {
            show_tongcheng_tab();
            $(document.body).click(function() {
                hide_tongcheng_tab();
                $(document.body).unbind("click", arguments.callee)
            })
        } else {
            hide_tongcheng_tab()
        }
        return false
    })
}
function show_tongcheng_tab() {
    $("#tongcheng_tab_block").show();
    $("#tongcheng_tab span").addClass("up")
}
function hide_tongcheng_tab() {
    $("#tongcheng_tab_block").hide();
    $("#tongcheng_tab span").removeClass("up")
}
__load_bk = $.fn.load;
$.fn.load_withck = function(b, c, d) {
    if ($.isFunction(c)) {
        d = c;
        c = {}
    }
    return __load_bk.call(this, b, $.extend(c, {ck: get_cookie("ck")}), d)
};
function exp_dialog(b) {
    var c = document.documentElement;
    return 0 - parseInt(b.offsetHeight / 2) + (TBWindowMargin = c && c.scrollTop || document.body.scrollTop) + "px"
}
function exp_overlay(b) {
    return 0 - parseInt(b.offsetHeight / 2) + (TBWindowMargin = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop) + "px"
}
function exp_sort_h2_over() {
    this.style.backgroundColor = "#eeffee"
}
function exp_sort_h2_out() {
    this.style.backgroundColor = ""
}
function getslider(h, n, d, b, k, g) {
    var c = 5, e = 100, l = 5, j = 0, f = function(o) {
        if (c + o > e) {
            c = e;
            h[0].className = "dis"
        } else {
            if (c + o < 5) {
                c = 5;
                n[0].className = "dis"
            } else {
                c += o
            }
        }
        n[0].className = c == 5 ? "dis" : "";
        h[0].className = c == e ? "dis" : "";
        j = (5 - c) * 105;
        d.animate({marginLeft: j + "px"}, {duration: 250 * Math.abs(o),easing: $.easing.easeOutCirc})
    };
    return function(o) {
        if (c + o > l && l < e) {
            $.postJSON_withck(b, {start: l,pp: k,cat_id: g}, function(p) {
                if (p.err) {
                    e = p.total;
                    l += p.num;
                    o = p.num;
                    d.html(d.html() + p.more_html);
                    f(o)
                }
            })
        } else {
            f(o)
        }
    }
}
Douban.init_song_interest = function(f) {
    var e = $(f), d = e.attr("id").split("-")[1], c = "n", b = "y";
    e.click(function() {
        var h = "/j/song/" + d + "/interest", g = e.hasClass("interest");
        $.post_withck(h, {action: (g ? c : b)}, function(j) {
            e.toggleClass("interest");
            if (g) {
                e.children().attr({src: "/pics/gray-heart.gif",title: "我喜欢",alt: "我喜欢"})
            } else {
                e.children().attr({src: "/pics/red-heart.gif",title: "取消'我喜欢'",alt: "取消'我喜欢'"})
            }
        });
        return false
    })
};
Douban.init_vote_comment = function(c) {
    if (window.location.hostname === "movie.douban.com" || /^movie\..*\.douban\.com/.test(window.location.hostname)) {
        var b = $(c).prev().prev(), d = $(c).prev().val();
        $(c).click(function() {
            $.postJSON_withck("/j/comment/vote", {id: d}, function(e) {
                if (e.count) {
                    b.text(e.count)
                } else {
                    alert("这条短评你已经投过票了")
                }
            })
        })
    }
};
Douban.init_rev_text = function(d) {
    if (window.location.hostname === "movie.douban.com" || /^movie\..*\.douban\.com/.test(window.location.hostname)) {
        var c = $(d).parents("form"), b = $("input[name=rev_submit]");
        b.click(function() {
            if ($(d).val().length < 50) {
                var e = /subject\/(\d*)/.exec(location.href)[1];
                $.getJSON("/j/comment/check", {sid: e}, function(f) {
                    if (f.has) {
                        if (confirm("少于50字的评论将被自动转为简短评论。并替换之前发表的简短评论内容。是否继续？")) {
                            c.submit()
                        }
                    } else {
                        c.submit()
                    }
                });
                return false
            }
            return true
        })
    }
};
Douban.init_popup = function(b) {
    $(b).click(function() {
        var c = / (\d+)x(\d+)$/.exec(b.className);
        if (!window.open(b.href, "popup", "height=" + c[2] + ",width=" + c[1] + ",toolbar=no,menubar=no,scrollbars=no,location=no,status=no")) {
            location.href = b.href
        }
        return false
    })
};
Douban.init_show_request_join_form = function(b) {
    $(b).click(function() {
        group_id = window.location.href.split("/")[4];
        return pop_win.load("/j/group/" + group_id + "/request_join_form")
    })
};
Douban.init_show_comment_form = function(b) {
    $(b).click(function() {
        $(b).hide();
        $("#comment_form").show()
    })
};
Douban.init_add2cart = function(b) {
    $(b).click(function() {
        $.post_withck("/cart", {add: b.name}, function() {
            $(b).next(".pl").hide();
            $(b).hide().nextAll(".hidden").show().yellow_fade()
        })
    })
};
Douban.init_switch_tab = function(b) {
    $(b).click(function() {
        $(".a_switch_tab").removeClass("current");
        $(b).addClass("current");
        $("#tag-loader").attr("class", "loading").text("");
        $.getJSON("/j/recommended/switch", {tag: b.name}, function(c) {
            $(".tag-fav-cloud").replaceWith(c.tags);
            load_event_monitor(".tag-fav-cloud");
            $(".rec-list").replaceWith(c.subjects);
            load_event_monitor(".rec-list")
        });
        return false
    })
};
Douban.init_switch_tab_movie = function(b) {
    $(b).click(function() {
        $(".a_switch_tab").removeClass("current");
        url = $("#hide_full_path").attr("name") + "/switch";
        $("#tag_all").removeClass("current");
        $(".tag-fav-cloud a").removeClass("current");
        $(b).addClass("current");
        $("#tag-loader").attr("class", "loading").text("");
        $.getJSON(url, {tag: b.name}, function(c) {
            $(".rec-list").replaceWith(c.subjects);
            load_event_monitor(".rec-list");
            $("#tag-loader").attr("class", "not-loading")
        });
        return false
    })
};
Douban.init_get_more = function(b) {
    $(b).click(function() {
        page = parseInt($(b).attr("attr")) + 10;
        url = $("#hide_full_path").attr("name") + "/switch";
        start = parseInt($(b).attr("start")) + 10;
        $(".a_switch_tab").removeClass("current");
        $(b).addClass("current");
        tag = b.name.replace("[", "", "g").replace("]", "", "g").replace("'", "", "g");
        $("#tag-loader").attr("class", "loading").text("");
        $.getJSON(url, {tag: tag,perpage: page,start: start}, function(c) {
            $(b).attr("attr", page);
            $(".rec-list").replaceWith(c.subjects);
            load_event_monitor(".rec-list");
            $("#tag-loader").attr("class", "not-loading")
        });
        return false
    })
};
Douban.init_nointerest_subject = function(b) {
    $(b).click(function() {
        tag = $(".tag-fav-cloud > .current").attr("name");
        $.post_withck("/j/recommended/nointerest_subject", {sid: b.name}, function(c) {
            if (c == "Y") {
                $("#tag-loader").attr("class", "loading").text();
                $.getJSON("/j/recommended/switch", {tag: tag}, function(d) {
                    $(".tag-fav-cloud").replaceWith(d.tags);
                    load_event_monitor(".tag-fav-cloud");
                    $(".rec-list").replaceWith(d.subjects);
                    load_event_monitor(".rec-list")
                })
            }
        });
        return false
    })
};
Douban.init_nointerest_entry = function(b) {
    $(b).click(function() {
        var c = b.href.match(/nointerest=(\d+)/)[1];
        $.post_withck("/j/recommended/nointerest_subject", {sid: c}, function(d) {
            if (d == "Y") {
                window.location.reload()
            }
        });
        return false
    })
};
Douban.init_nointerest_subject_tab = function(b) {
    $(b).click(function() {
        tag = $(".tag-fav-cloud > .current").attr("name");
        $.post_withck("/j/recommended/nointerest_subject", {sid: b.name,tag: $(b).attr("tag")}, function(c) {
            if (c == "Y") {
                $("#tag-loader").attr("class", "loading").text();
                $.getJSON("/j/recommended/switch", {tag: $(b).attr("tag")}, function(d) {
                    $(".tag-fav-cloud").replaceWith(d.tags);
                    load_event_monitor(".tag-fav-cloud");
                    $(".rec-list").replaceWith(d.subjects);
                    load_event_monitor(".rec-list")
                })
            }
        });
        return false
    })
};
Douban.init_nointerest_subject_movie = function(b) {
    $(b).click(function() {
        url = $("#hide_full_path").attr("name") + "/nointerest_subject";
        self_item = $(this).parents(".item");
        var c = true;
        _self = this;
        if (c) {
            tag = $(".tag-fav-cloud > .current").attr("name");
            total = $(".a_get_more").attr("attr");
            $.post_withck(url, {sid: b.name}, function(d) {
                if (d == "Y") {
                    self_item.fadeOut(function() {
                        $.getJSON($("#hide_full_path").attr("name") + "/switch", {tag: tag,perpage: total}, function(e) {
                            $(".rec-list").replaceWith(e.subjects);
                            load_event_monitor(".rec-list");
                            $("#tag-loader").attr("class", "not-loading")
                        })
                    })
                }
            })
        }
        return false
    })
};
Douban.init_nointerest_subject_top = function(b) {
    $(b).click(function() {
        url = $("#hide_full_path").attr("name") + "/nointerest_subject_top";
        var c = true;
        _self = this;
        if (c) {
            $(_self).parents("li").fadeOut("slow", function() {
                $(this).remove()
            });
            last_num -= 1;
            cover_num -= 1;
            if (cover_num === 0) {
                $("#movie-rec").remove()
            }
            if (last_num === 5) {
                $(".btn-next > a").addClass("dis")
            }
            $(".detail-tip").remove();
            $.post_withck(url, {sid: b.name}, function(d) {
                if (d === "Y") {
                }
            })
        }
        return false
    })
};
Douban.init_nointerest_doulist = function(b) {
    $(b).click(function() {
        $("#doulist-loader").attr("class", "loading");
        $.post_withck("/j/recommended/nointerest_doulist", {dl_del: b.name}, function(c) {
            $(".simple-dashed-list").replaceWith(c);
            load_event_monitor(".simple-dashed-list");
            $("#doulist-loader").attr("class", "not-loading")
        });
        return false
    })
};
Douban.init_nointerest_doulist_movie = function(b) {
    $(b).click(function() {
        url = $("#hide_full_path").attr("name") + "/nointerest_doulist";
        $("#doulist-loader").attr("class", "loading");
        $.post_withck(url, {dl_del: b.name}, function(c) {
            $(".simple-dashed-list").replaceWith(c);
            load_event_monitor(".simple-dashed-list");
            $("#doulist-loader").attr("class", "not-loading")
        });
        return false
    })
};
Douban.init_post_link = function(b) {
    $(b).click(function(h) {
        var d = $(this), c = d.attr("href"), o = d.attr("title") || d.text() + "?", g = d.attr("rel") == "direct", j = d.attr("target"), l = c.split("?")[0], n = {}, k = c.split("?")[1] || [];
        if (typeof k === "string") {
            k = k.split("&")
        }
        h.preventDefault();
        if (d.hasClass("processing")) {
            return
        }
        if (g) {
            var p = [];
            k.push("ck=" + get_cookie("ck"));
            for (i = 0, f; i < k.length; i++) {
                f = k[i].split("=");
                p.push('<input type="hidden" name="' + f[0] + '" value="' + f[1] + '">')
            }
            $('<form action="' + l + '" method="POST" target="' + (j || "_self") + '" sytle="display:none">' + p.join("") + "</form>").appendTo("body").submit()
        } else {
            for (i = 0; i < k.length; i++) {
                var f = k[i].split("=");
                n[f[0]] = f[1]
            }
            if (confirm(o)) {
                d.addClass("processing");
                $.post_withck(l, n, function(q) {
                    d.removeClass("processing");
                    location.reload(true)
                })
            }
        }
    })
};
try {
    document.execCommand("BackgroundImageCache", false, true)
} catch (err) {
}
Douban.init_donate = function() {
    var p = '<div class="blocktip dou-tip">{BODY}</div>', l = '<form action="" method="post"><div class="frm-item">你将向作者赠送<b>1</b>颗小豆</div><div class="frm-item"><label for="dou-inp-msg">顺带捎个话...</label><input id="dou-inp-msg" type="text" name="note"></div><div class="frm-submit"><span class="bn-flat"><input type="submit" value="送出"></span><a href="#" class="tip-bn-cancel">取消</a></div></form>', c = '<p>“感谢”将向作者赠送<b>1</b>颗小豆，你还没有小豆。<br><a href="http://www.douban.com/help/account#t4-q1">怎样获取小豆?</a></p><span class="bn-flat"><input type="button" class="tip-bn-cancel"  value="知道了"></span>', k = '<span class="donated-fail">{MSG}</span>', q = '<span class="donated-success">{MSG}</span>', d = "<p>处理中，请稍候...</p>", f = ".tip-bn-cancel", e = "processing", j = function(s, u) {
        s.replaceWith(k.replace("{MSG}", u));
        b()
    }, h = function(s, w) {
        b();
        var v = $(p.replace("{BODY}", s)).appendTo("body"), z = w.offset(), u = [], y = $(window), x = y.scrollTop() + y.height();
        if ((x - z.top) < (v.height() + 20)) {
            u = [z.left, z.top - v.height() - w.height()]
        } else {
            u = [z.left, z.top + w.height()]
        }
        v.css({position: "absolute",left: u[0] + "px",top: u[1] + "px"});
        return v.show()
    }, b = function() {
        $(".dou-tip").remove()
    }, o = function(u, v) {
        var y = v.offset(), s = [], x = $(window), w = x.scrollTop() + x.height();
        if ((w - y.top) < (u.height() + 20)) {
            s = [y.left, y.top - u.height() - v.height()]
        } else {
            s = [y.left, y.top + v.height()]
        }
        u.css({left: s[0] + "px",top: s[1] + "px"})
    }, n = function(u) {
        var s = function(v) {
            if (v.error) {
                this.elm.replaceWith(k.replace("{MSG}", v.error))
            } else {
                this.elm.replaceWith(q.replace("{MSG}", v.msg))
            }
            b()
        };
        u.preventDefault();
        this.args.is_first = 0;
        this.args.note = $.trim(u.target.elements.note.value);
        this.relateTip.html(d);
        o(this.relateTip, this.elm);
        $.dataPoster(this.url, this.args, $.proxy(s, this), "post", "json")
    }, g = function(s) {
        s.preventDefault();
        b();
        if (this.elm) {
            this.elm.removeClass(e)
        }
    }, r = function(s) {
        var x = this.elm, w, v, u;
        if (s.error) {
            j(x, s.error);
            return
        }
        if (s.balance) {
            u = h(l, x);
            this.relateTip = u;
            u.find("form").bind("submit", $.proxy(n, this));
            u.find(f).bind("click", $.proxy(g, this));
            u.find("input[type=text]").bind({focusin: function(y) {
                    $(this).prev().hide()
                },focusout: function(y) {
                    if (this.value === "") {
                        $(this).prev().show()
                    }
                }})
        } else {
            u = h(c, x);
            u.css("width", 260 + "px");
            this.relateTip = u;
            u.find(f).bind("click", $.proxy(g, this))
        }
        $(window).bind("resize", function() {
            o(u, x)
        })
    };
    $("body").delegate(".btn-donate", "click", function(z) {
        var B = $(z.currentTarget), s = B.attr("href").split("?"), w, u, x, y, v = {elm: B}, A = {is_first: 1};
        z.preventDefault();
        if (B.hasClass(e)) {
            return
        }
        B.addClass(e);
        if (s[1]) {
            w = s[1].split("&");
            for (x = 0, y = w.length; x < y; x++) {
                u = w[x].split("=");
                A[u[0]] = u[1] || ""
            }
        }
        v.args = A;
        v.url = s[0];
        $.dataPoster(s[0], A, $.proxy(r, v), "post", "json")
    })
};
$(function() {
    load_event_monitor(document)
});