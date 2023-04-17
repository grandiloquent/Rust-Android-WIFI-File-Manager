use std::path::Path;
use rocket::http::Status;
use regex::Regex;
use std::fs::File;
use std::io::{BufReader, BufRead};
fn is_timecode(line: &str) -> bool {
    line.contains("-->")
}
fn delete_cue_settings(line: &str) -> String {
    let mut output = String::new();
    let comma_line = line.replace(".", ",");
    for ch in comma_line.chars() {
        let ch_lower = ch.to_ascii_lowercase();
        if ch_lower >= 'a' && ch_lower <= 'z' {
            break;
        }
        output.push(ch_lower)
    }
    output.trim().to_string()
}
pub fn transform(input_path: &Path)
                 -> String
{
    let f = File::open(input_path).unwrap();
    let reader = BufReader::new(f);
    let timing = match Regex::new(
        r"(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})$") {
        Ok(v) => v,
        Err(error) => {
            log::error!("{}",error.to_string());
            Regex::new("").unwrap()
        }
    };
    let mut skip: bool = false;
    let mut deleted_subs = 0;
    let mut s = "WEBVTT\n".to_string();
    for line in reader.lines() {
        let mut new_line = line.unwrap_or(String::new());
        let is_timeline: bool = timing.is_match(&new_line);
        if is_timeline {
            new_line = new_line.replace(",", ".");
            new_line = process_line(new_line);
            if new_line == "(DELETED)\n" {
                deleted_subs += 1;
                skip = true; // skip/delete upcoming subtitles
            }
        } else if skip {
            // Subtitles can be 1 or 2 lines;
            // only reset skip if we have arrived at an empty line:
            if new_line == "" {
                skip = false;
            }
            continue;
        }
        // Add \n to the lines before writing them:
        s = s + new_line.as_str() + "\n"
    }
    return s;
}
fn process_line(time_line: String) -> String
{
    let (line_start, line_end): (f64, f64);
    // Create block so &time_line borrow ends before return:
    {
        let start_str = &time_line[0..12];
        let end_str = &time_line[17..29];
        line_start = get_secs(start_str);
        line_end = get_secs(end_str);
    }
    let start_string = build_time_string(line_start);
    let end_string = build_time_string(line_end);
    if end_string == "(DELETED)\n" {
        end_string
    } else if start_string == "(DELETED)\n" {
        format!("00:00:00.000 --> {}", end_string)
    } else {
        format!("{} --> {}", start_string, end_string)
    }
}
/// Processes a &str of the form 'hh:mm:ss.sss'
/// into the total number of seconds as f64.
pub fn get_secs(time_string: &str) -> f64 {
    time_string.rsplit(":")
        // can't panic since time_string is validated by regex:
        .map(|t| t.parse::<f64>().unwrap())
        .zip(&[1.0, 60.0, 3600.0])
        .map(|(a, b)| a * b)
        .sum()
}
fn build_time_string(seconds: f64) -> String {
    if seconds >= 0.0 {
        let hours = seconds as u64 / 3600;
        let mins = (seconds as u64 % 3600) / 60;
        let secs = seconds % 60.0;
        format!("{0:02}:{1:02}:{2:06.3}", hours, mins, secs)
    } else {
        // the subtitles are now scheduled before the start
        // of the movie, so we can delete them:
        String::from("(DELETED)\n")
    }
}
#[get("/subtitle?<path>")]
pub fn subtitle<'a>(path: String) -> Result<String, Status> {
    let p = Path::new(path.as_str());
    if !p.is_file() {
        return Err(Status::NotFound);
    }
    Ok(transform(p))
    // converts file to WEBVTT
}