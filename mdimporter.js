Hooks.on("renderSidebarTab", async (app, html) => {
    if(app instanceof JournalDirectory){
        let button = $("<button class='import-md'><i class='fas fa-file-import'></i>Obsidian .md Import</button>")
        html.find(".directory-footer").append(button);
    }
});