use rocket::form::Form;
use rocket::fs::TempFile;

#[derive(FromForm)]
pub struct UploadData<'f> {
    key: Option<String>,
    data: TempFile<'f>,
}

#[derive(FromForm)]
pub struct Upload<'f> {
    f: TempFile<'f>,
}

#[post("/upload", format = "multipart/form-data", data = "<form>")]
pub async fn upload(mut form: Form<Upload<'_>>) -> std::io::Result<()> {
    log::error!("{}", "::upload");
    log::error!("Uploading {}",form.into_inner().f.name().unwrap());
    //form.upload.persist_to("/tmp/complete/file.txt").await?;
    Ok(())
}