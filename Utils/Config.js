//var requestPath = "https://demo.parli.com.br/Client/";
var requestPath = "https://assistant.sophie.chat/";
var rootDir = "https://assistant.sophie.chat/";
var tenant = "s3nd";
var contentDir = "";


localStorage.setItem("requestPath", requestPath);

/* UploadFiles Config*/
function UploadFileConfig()
{
    this.filesWithoutScroll = 7;
    this.fileMaxSize = 5242880;
    this.fileMaxQty = 10;
    this.fileMaxAttempt = 3;
    this.fileMaxSizeError = "*Existe(m) arquivo(s) que ultrapassam o tamanho limite de:"; 
    this.fileMaxQtyError = "*Quantidade máxima de arquivos permitida:";
    this.fileAttemptAlert = "";
    this.msgUploadSucess = "filesuploadedsuccessfully";
    this.msgFileNotSent = "filesnotsent";
}