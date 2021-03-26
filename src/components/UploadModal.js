import { useState, useContext, useEffect } from "react";
import Modal from "@material-ui/core/Modal";
import PublishIcon from "@material-ui/icons/Publish";
import AddIcon from "@material-ui/icons/Add";
import { storage, db } from "../firebase/config";
import { Context } from "../Context/GlobalState";
import ProgressBar from "./ProgressBar";
import CloseIcon from "@material-ui/icons/Close";

export default function UploadModal({ open, handleClose }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const { user } = useContext(Context);

  useEffect(() => {
    setError("");
  }, [file]);

  const handleUpload = (e) => {
    e.preventDefault();

    if (allowedTypes.includes(file.type)) {
      const storageRef = storage.ref(file.name);

      // file uploading

      storageRef.put(file).on(
        "state_changed",
        (snapshot) => {
          const percent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.floor(percent));
        },
        (err) => {
          setError(err);
        },
        async () => {
          const url = await storageRef.getDownloadURL();

          // Set progress back to null after file upload completion
          setProgress(null);

          // Adding to the database
          db.collection("posts").add({
            url,
            caption,
            user: {
              displayName: user.displayName,
              photoURL: user.photoURL,
              username: user.username,
            },
          });
        }
      );
    } else {
      setError("Only JPG/PNG allowed");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="modal__container">
        <div className="modal__body">
          <a href="#!" onClick={handleClose} className="close__uploadModal">
            <CloseIcon />
          </a>
          <form onSubmit={handleUpload}>
            <input
              type="file"
              id="file"
              className="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file" className="file__placeholder">
              <h4>
                <AddIcon /> {file ? file.name : "Select a file to upload"}
              </h4>
            </label>
            <textarea
              name="caption"
              id=""
              cols="30"
              rows="10"
              placeholder="Caption"
              className="form__caption"
              onChange={(e) => setCaption(e.target.value)}
              value={caption}
            ></textarea>
            <button className="primary-insta-btn">
              <PublishIcon /> Upload
            </button>
            {progress > 0 && <ProgressBar progress={progress} />}
            {error && <div className="upload__error">{error}</div>}
          </form>
        </div>
      </div>
    </Modal>
  );
}