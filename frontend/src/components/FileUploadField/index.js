import React, {useCallback, useEffect, useState, useRef} from "react"
import classnames from "classnames"
import md5 from "md5"
import {useSnackbar} from "notistack"
import useApi from "../../api/useApi"

import DroppedFile from "../DroppedFile"
import ExternalFile from "../ExternalFile"

import styles from "./index.module.scss"

const getFileId = file =>
	md5(`${file.name}${file.size}${file.lastModified}${new Date().valueOf()}`)

const FileUploadField = props => {
	const {
		onChange: onChangeProp,
		onFinish,
		value,
		accept,
		placeholder,
		name,
		className,
		classes = {},
	} = props

	const {enqueueSnackbar} = useSnackbar()
	const {download} = useApi()

	const [showFullScreenDrop, setShowFullScreenDrop] = useState(false)
	const fullScreenDropRef = useRef(null)

	const onChange = useCallback(
		e => {
			const files = Array.from(e.target?.files || [])
			onChangeProp(
				files.map(file => {
					file.id = getFileId(file)
					return {
						type: "file",
						data: file,
					}
				})
			)
		},
		[onChangeProp]
	)

	useEffect(() => {
		const fullScreenDropEl = fullScreenDropRef.current
		let entered = false

		const onDragEnter = e => {
			e.preventDefault()
			if (entered) return
			entered = true
			setShowFullScreenDrop(true)
		}

		const onDragLeave = e => {
			e.preventDefault()
			entered = false
			setShowFullScreenDrop(false)
		}

		const onDrop = e => {
			onDragLeave(e)
			const result = []
			const data = e.dataTransfer.items

			let isHtml = false
			for (let i = 0; i < data.length; i += 1) {
				const item = data[i]

				if (item.kind === "string" && item.type === "text/html") {
					console.log(123)
					isHtml = true
					item.getAsString(async htmlString => {
						try {
							const htmlDOM = new DOMParser().parseFromString(
								htmlString,
								"text/html"
							)
							const src =
								htmlDOM.getElementsByTagName("img")[0].src
							onChangeProp({
								type: "url",
								data: src,
							})
						} catch (err) {
							enqueueSnackbar({
								variant: "error",
								message: "Couldn't read the dropped file",
							})
							console.error(err)
						}
					})
				} else if (item.kind === "file" && !isHtml) {
					const file = item.getAsFile()
					if (/^image\/.+$/.test(file.type)) {
						file.id = getFileId(file)
						result.push({
							type: "file",
							data: file,
						})
					}
				}
			}

			if (result.length) onChangeProp(result)
		}

		window.addEventListener("dragover", onDragEnter)
		//window.addEventListener("drop", onDrop)
		//window.addEventListener("dragend", onDragLeave)
		fullScreenDropEl.addEventListener("dragleave", onDragLeave)
		fullScreenDropEl.addEventListener("dragend", onDragLeave)
		fullScreenDropEl.addEventListener("drop", onDrop)

		return () => {
			window.removeEventListener("dragover", onDragEnter)
			//window.removeEventListener("drop", onDrop)
			//window.removeEventListener("dragend", onDragLeave)
			fullScreenDropEl.removeEventListener("dragleave", onDragLeave)
			fullScreenDropEl.removeEventListener("dragend", onDragLeave)
			fullScreenDropEl.removeEventListener("drop", onDrop)
		}
	}, [onChangeProp, enqueueSnackbar, download])

	return (
		<div className={classnames(styles.root, className, classes.root)}>
			<div
				className={classnames(
					styles.fullScreenDrop,
					showFullScreenDrop && styles.visible
				)}
				ref={fullScreenDropRef}
			>
				<div className={styles.fullScreenDropArea}>{placeholder}</div>
			</div>

			<div className={styles.droppedFilesContainer}>
				{value &&
					value.map(file =>
						file.type === "file" ? (
							<DroppedFile
								key={file.data.id}
								file={file.data}
								className={styles.droppedFile}
								onFinish={onFinish}
							/>
						) : (
							<ExternalFile
								key={file.data}
								url={file.data}
								className={styles.droppedFile}
								onFinish={onFinish}
							/>
						)
					)}
			</div>
			<div className={styles.dropArea}>
				<input
					className={styles.input}
					type="file"
					name={name}
					value=""
					onChange={onChange}
					accept={accept}
					multiple
				/>
				{placeholder}
			</div>
		</div>
	)
}

export default FileUploadField
