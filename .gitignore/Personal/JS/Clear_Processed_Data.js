<script runat="server">
    Platform.Load("Core","1.1.1");

    try {
        var deName = "575764A9-72D8-4174-A222-BA795FB46B89"; 
        var de = DataExtension.Init(deName);
        var deleteCount = de.Rows.Remove(["IsProcessed"], ["1"]);
        Write("Successfully deleted " + deleteCount + " rows.");

    } catch(e) {
        Write("Error: " + Stringify(e));
    }
</script>