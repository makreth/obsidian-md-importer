Hooks.on("renderSidebarTab", async (app, html) => {
    if(app instanceof JournalDirectory){
        let button = $("<button class='import-md'><i class='fas fa-file-import'></i>Obsidian .md Import</button>");
        button.click(function(){
            new MdImporter().render(true);
        })
        html.find(".directory-footer").append(button);
    }
});

class MdImporter extends FormApplication{

    static get defaultOptions(){
        const options = super.defaultOptions;
        options.id = "md-importer";
        options.template = "modules/obsidian-md-importer/mdimporter.html";
        options.classes.push("md-importer");
        options.resizable = false;
        options.height = "auto";
        options.width = 400;
        options.minimizable = true;
        options.title = "Obsidian .md Importer";
        return options;
    }

    async _updateObject(event, formData){
        let fileText = await this.element.find("[name=file0]")[0].files[0].text()
        console.log(fileText);
    }
}