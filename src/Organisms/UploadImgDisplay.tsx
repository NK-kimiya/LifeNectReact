import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { uploadFile, fetchFiles, UploadedFile } from "../API/File.tsx";
const ScrollBox = styled.div`
  min-height: 100vh;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
`;

// サイドバーに表示する要素の型
type SidebarItem = {
  id: number;
  imageUrl: string;
  urlText: string;
};

const UploadImgDisplay = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const data = await fetchFiles();
        setFiles(data);
      } catch {
        setError("ファイル一覧の取得に失敗しました");
      }
    };
    loadFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("アップロードするファイルを選択してください");
      return;
    }
    try {
      const uploaded = await uploadFile(selectedFile);
      setFiles([uploaded, ...files]); // 先頭に追加
      setSelectedFile(null);
      setError("");
    } catch {
      setError("ファイルのアップロードに失敗しました");
    }
  };

  return (
    <>
      <h3>ファイルアップロード</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="file" onChange={handleFileChange}></input>
      <button className="btn btn-primary ms-2" onClick={handleUpload}>
        アップロード
      </button>
      <ScrollBox>
        {files.map((file) => (
          <div className="">
            <div key={file.id} className="card mb-3">
              <img src={file.file_url} className="card-img-top" alt="" />
              <div className="card-body">
                <input
                  type="text"
                  className="form-control"
                  value={file.file_url}
                  readOnly
                />
                <br />
                <small>
                  Uploaded at: {new Date(file.uploaded_at).toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </ScrollBox>
    </>
  );
};

export default UploadImgDisplay;
