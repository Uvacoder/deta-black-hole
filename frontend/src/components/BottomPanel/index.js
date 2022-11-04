import React from "react"
import classnames from "classnames"
import Container from "@mui/material/Container"

import styles from "./index.module.scss"

export default function BottomPanel(props) {
	const {isVisible, children, className, ...rest} = props

	return (
		<div className={classnames(styles.root, className)} {...rest}>
			<Container maxWidth="md" className={styles.container}>
				<div
					className={classnames(
						styles.panel,
						className,
						isVisible && styles.visible
					)}
				>
					{children}
				</div>
			</Container>
		</div>
	)
}
