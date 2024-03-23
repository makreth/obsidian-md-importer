Hooks.on("renderSidebarTab", async (app, html) => {
    if (app instanceof JournalDirectory) {
        let button = $("<button class='import-md'><i class='fas fa-file-import'></i>Obsidian .md Import</button>");
        button.click(function () {
            new MdImporter().render(true);
        })
        html.find(".directory-footer").append(button);
    }
});

class MdImporter extends FormApplication {

    static get defaultOptions() {
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

    /*
    * JS file schema
    * name: string of name of file
    * path: string of absolute path of file
    * type: string of type, e.g. "text/markdown"
    * webkitRelativePath: string of relative path, including filename at the end of the path.
    * Relative from folder selected by user
    * 
    * Functions
    * text(): grabs the text of a file if it contains text
    * 
    * All folder paths grabbed in Foundry are forward slash paths
    */

    async _updateObject(event, formData) {
        let files = await this.element.find("[name=folder-select]")[0].files;
        let objectUuidMapping = {};
        Array.from(files).forEach((file) => {
            let folderLevels = extractAllParentPaths(file);
        });
        Array.from(files).forEach((file) => {
            console.log(file);
        })
    }

    static extractAllParentPaths(path) {
        if (path === null) {
            return;
        }
        if (typeof path === "string" && path.length === 0) {
            return;
        }

        current_path = "";
        return path.split("/").map((path_node) => {
            current_path += "/" + path_node;
            return current_path;
        }).reverse();
    }
}